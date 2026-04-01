"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, signIn } from "@/auth";
import { generateAIResponse } from "@/lib/ai/provider";
import { prisma } from "@/lib/prisma";
import { scoreSpecification, scoreThinking, scoreVerification } from "@/lib/scoring/engine";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid sign-up input");

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "STUDENT",
      profile: { create: { xp: 0, streak: 0, level: 1 } },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/app",
  });
}

export async function signInAction(formData: FormData) {
  await signIn("credentials", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: "/app",
  });
}

export async function startPodRun(podSlug: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const pod = await prisma.outcomePod.findUnique({ where: { slug: podSlug }, include: { tasks: true } });
  if (!pod) throw new Error("Pod not found");

  const existing = await prisma.podRun.findFirst({ where: { userId: session.user.id, outcomePodId: pod.id, status: { in: ["NOT_STARTED", "IN_PROGRESS"] } } });
  if (existing) redirect(`/app/runs/${existing.id}`);

  const run = await prisma.podRun.create({
    data: {
      userId: session.user.id,
      outcomePodId: pod.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      taskResponses: {
        create: pod.tasks.map((task) => ({
          podTaskId: task.id,
          attemptText: "",
          reasoningText: "",
          goalText: "",
          constraintsText: "",
          definitionOfDoneText: "",
        })),
      },
    },
  });

  redirect(`/app/runs/${run.id}`);
}

const saveTaskSchema = z.object({
  taskResponseId: z.string(),
  attemptText: z.string().min(30),
  reasoningText: z.string().min(30),
  goalText: z.string().min(10),
  constraintsText: z.string().min(10),
  definitionOfDoneText: z.string().min(10),
});

export async function saveTaskFoundation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = saveTaskSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid submission");

  const response = await prisma.taskResponse.update({
    where: { id: parsed.data.taskResponseId },
    data: {
      attemptText: parsed.data.attemptText,
      reasoningText: parsed.data.reasoningText,
      goalText: parsed.data.goalText,
      constraintsText: parsed.data.constraintsText,
      definitionOfDoneText: parsed.data.definitionOfDoneText,
    },
    include: { podRun: true },
  });

  const thinking = scoreThinking(parsed.data.attemptText, parsed.data.reasoningText);
  const spec = scoreSpecification(parsed.data.goalText, parsed.data.constraintsText, parsed.data.definitionOfDoneText);

  await prisma.$transaction([
    prisma.scoreEvent.createMany({
      data: [
        { userId: session.user.id, podRunId: response.podRunId, category: thinking.category, value: thinking.value, reason: "Submitted attempt + reasoning" },
        { userId: session.user.id, podRunId: response.podRunId, category: spec.category, value: spec.value, reason: "Submitted structured specification" },
      ],
    }),
    prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        thinkingScore: { increment: thinking.value },
        specScore: { increment: spec.value },
        xp: { increment: thinking.value + spec.value },
      },
    }),
  ]);

  revalidatePath(`/app/runs/${response.podRunId}`);
}

export async function unlockAI(taskResponseId: string) {
  const response = await prisma.taskResponse.findUnique({
    where: { id: taskResponseId },
    include: { podTask: { include: { outcomePod: true } } },
  });
  if (!response) throw new Error("Response missing");
  if (!response.attemptText || !response.goalText || !response.constraintsText || !response.definitionOfDoneText) {
    throw new Error("CAOS rules require attempt + full spec before AI unlock");
  }

  const aiOutputText = await generateAIResponse({
    podSlug: response.podTask.outcomePod.slug,
    prompt: response.podTask.prompt,
    attempt: response.attemptText,
    reasoning: response.reasoningText,
    goal: response.goalText,
    constraints: response.constraintsText,
    definitionOfDone: response.definitionOfDoneText,
  });

  await prisma.taskResponse.update({ where: { id: taskResponseId }, data: { aiOutputText } });
  revalidatePath(`/app/runs/${response.podRunId}`);
}

const verifySchema = z.object({
  taskResponseId: z.string(),
  verificationDecision: z.enum(["ACCEPT", "MODIFY", "REJECT"]),
  verificationExplanation: z.string().min(20),
  finalAnswerText: z.string().min(20),
});

export async function submitVerification(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = verifySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Invalid verification submission");

  const existing = await prisma.taskResponse.findUnique({ where: { id: parsed.data.taskResponseId } });
  if (!existing?.aiOutputText) throw new Error("AI output required first");

  const ver = scoreVerification(parsed.data.verificationDecision, parsed.data.verificationExplanation, parsed.data.finalAnswerText, existing.aiOutputText);

  await prisma.$transaction([
    prisma.taskResponse.update({
      where: { id: parsed.data.taskResponseId },
      data: {
        verificationDecision: parsed.data.verificationDecision,
        verificationExplanation: parsed.data.verificationExplanation,
        finalAnswerText: parsed.data.finalAnswerText,
        isComplete: true,
      },
    }),
    prisma.scoreEvent.create({
      data: {
        userId: session.user.id,
        podRunId: existing.podRunId,
        category: ver.category,
        value: ver.value,
        reason: `Verification decision: ${parsed.data.verificationDecision}`,
      },
    }),
    prisma.profile.update({
      where: { userId: session.user.id },
      data: { verificationScore: { increment: ver.value }, xp: { increment: ver.value } },
    }),
  ]);

  const allDone = await prisma.taskResponse.count({ where: { podRunId: existing.podRunId, isComplete: false } });
  if (allDone === 0) {
    await prisma.podRun.update({ where: { id: existing.podRunId }, data: { status: "COMPLETED", completedAt: new Date(), submittedAt: new Date() } });
  }

  if (parsed.data.verificationDecision === "REJECT") {
    const badge = await prisma.badge.findUnique({ where: { name: "Caught the Machine" } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: session.user.id, badgeId: badge.id } },
        create: { userId: session.user.id, badgeId: badge.id },
        update: {},
      });
    }
  }

  revalidatePath(`/app/runs/${existing.podRunId}`);
}
