import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.userBadge.deleteMany();
  await prisma.scoreEvent.deleteMany();
  await prisma.taskResponse.deleteMany();
  await prisma.podRun.deleteMany();
  await prisma.podTask.deleteMany();
  await prisma.outcomePod.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, studentPassword] = await Promise.all([hash("Admin123!", 10), hash("Student123!", 10)]);

  const admin = await prisma.user.create({
    data: {
      name: "CAOS Admin",
      email: "admin@caos.local",
      passwordHash: adminPassword,
      role: "ADMIN",
      profile: { create: { level: 8, xp: 940, streak: 12, thinkingScore: 72, specScore: 69, verificationScore: 74 } },
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@caos.local",
      passwordHash: studentPassword,
      role: "STUDENT",
      profile: { create: { level: 3, xp: 260, streak: 4, thinkingScore: 28, specScore: 26, verificationScore: 22 } },
    },
  });

  const pods = await Promise.all([
    prisma.outcomePod.create({
      data: {
        slug: "think-before-ai",
        title: "Think Before AI",
        shortDescription: "Build first-pass reasoning before touching AI guidance.",
        fullDescription: "This mission trains independent attempts first, then compares your cognitive path with AI suggestions.",
        difficulty: "BEGINNER",
        estimatedMinutes: 35,
        status: "PUBLISHED",
        learningObjectives: [
          "make an independent attempt",
          "compare your reasoning to AI output",
          "understand why first-pass thinking matters",
        ],
        tasks: { create: [
          { title: "Independent Draft", prompt: "Outline a 30-day learning plan for a new analyst.", instructions: "Write the first plan with no AI input.", position: 1, expectedMode: "FOUNDATION" },
          { title: "Reasoning Audit", prompt: "Explain why your sequence and priorities make sense.", instructions: "Expose your assumptions and tradeoffs.", position: 2, expectedMode: "GUIDED_AI" },
        ] },
      },
    }),
    prisma.outcomePod.create({
      data: {
        slug: "specification-is-everything",
        title: "Specification Is Everything",
        shortDescription: "Learn why vague requests produce weak outputs.",
        fullDescription: "This mission forces structured specification before AI unlock: goal, constraints, and definition of done.",
        difficulty: "INTERMEDIATE",
        estimatedMinutes: 40,
        status: "PUBLISHED",
        learningObjectives: ["define a goal clearly", "add constraints", "define what done means", "observe how better specs improve results"],
        tasks: { create: [
          { title: "Spec Draft", prompt: "Create a prompt for drafting a launch memo.", instructions: "Specify audience, format, and non-negotiables.", position: 1, expectedMode: "FOUNDATION" },
          { title: "Constraint Upgrade", prompt: "Add quality constraints for legal and tone consistency.", instructions: "Be explicit and measurable.", position: 2, expectedMode: "GUIDED_AI" },
          { title: "Done Criteria", prompt: "Define done conditions for the memo.", instructions: "Use objective completion checks.", position: 3, expectedMode: "GUIDED_AI" },
        ] },
      },
    }),
    prisma.outcomePod.create({
      data: {
        slug: "catch-the-machine",
        title: "Catch the Machine",
        shortDescription: "Practice rejecting confident but unreliable AI output.",
        fullDescription: "This mission introduces intentionally flawed AI-style responses so you can detect and repair errors.",
        difficulty: "ADVANCED",
        estimatedMinutes: 45,
        status: "PUBLISHED",
        learningObjectives: ["inspect outputs critically", "identify errors", "explain why an answer is wrong", "produce a corrected answer"],
        tasks: { create: [
          { title: "Risk Scan", prompt: "Evaluate an AI recommendation for operational policy.", instructions: "Find hidden risks and unsupported claims.", position: 1, expectedMode: "FOUNDATION" },
          { title: "Corrective Rewrite", prompt: "Rewrite the flawed recommendation into a reliable answer.", instructions: "Cite concrete checks and safeguards.", position: 2, expectedMode: "GUIDED_AI" },
        ] },
      },
    }),
  ]);

  const [firstAttempt, clearSpec, caughtMachine] = await Promise.all([
    prisma.badge.create({ data: { name: "First Attempt", description: "Completed your first independent attempt." } }),
    prisma.badge.create({ data: { name: "Clear Spec", description: "Delivered strong goal, constraints, and done criteria." } }),
    prisma.badge.create({ data: { name: "Caught the Machine", description: "Rejected a flawed AI output with evidence." } }),
  ]);

  const sampleRun = await prisma.podRun.create({
    data: {
      userId: student.id,
      outcomePodId: pods[0].id,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
    },
  });

  const tasks = await prisma.podTask.findMany({ where: { outcomePodId: pods[0].id }, orderBy: { position: "asc" } });
  await prisma.taskResponse.createMany({
    data: tasks.map((task) => ({
      podRunId: sampleRun.id,
      podTaskId: task.id,
      attemptText: "I first drafted a weekly structure with milestones and measurable check-ins before any AI guidance.",
      reasoningText: "My reasoning prioritized cognitive load and sequence, then pressure-tested assumptions on pacing.",
      goalText: "Produce a practical 30-day onboarding map with weekly outputs.",
      constraintsText: "Must fit 6 hrs/week, include review checkpoints, and avoid overloading week 1.",
      definitionOfDoneText: "Done when each week has concrete outputs, checks, and revision gates.",
      aiOutputText: "AI suggested a generic plan.",
      verificationDecision: "MODIFY",
      verificationExplanation: "AI missed constraints around load balancing and lacked measurable checkpoints.",
      finalAnswerText: "Revised plan includes scoped deliverables and verification gates.",
      isComplete: true,
    })),
  });

  await prisma.scoreEvent.createMany({
    data: [
      { userId: student.id, podRunId: sampleRun.id, category: "THINKING", value: 16, reason: "Strong initial attempt" },
      { userId: student.id, podRunId: sampleRun.id, category: "SPECIFICATION", value: 17, reason: "Clear constraints and done criteria" },
      { userId: student.id, podRunId: sampleRun.id, category: "VERIFICATION", value: 18, reason: "Modified flawed output with rationale" },
    ],
  });

  await prisma.userBadge.createMany({
    data: [
      { userId: student.id, badgeId: firstAttempt.id },
      { userId: student.id, badgeId: clearSpec.id },
      { userId: student.id, badgeId: caughtMachine.id },
    ],
  });

  await prisma.scoreEvent.create({ data: { userId: admin.id, category: "THINKING", value: 10, reason: "Seed admin history" } });
}

main().finally(async () => {
  await prisma.$disconnect();
});
