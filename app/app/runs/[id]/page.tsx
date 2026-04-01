import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { saveTaskFoundation, submitVerification, unlockAI } from "@/server/actions";

export default async function PodRunPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { id } = await params;

  const run = await prisma.podRun.findUnique({
    where: { id },
    include: {
      outcomePod: true,
      taskResponses: { include: { podTask: true }, orderBy: { createdAt: "asc" } },
      scoreEvents: true,
    },
  });
  if (!run || run.userId !== session.user.id) redirect("/app");

  const activeTask = run.taskResponses.find((t) => !t.isComplete) ?? run.taskResponses[0];

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-8 lg:grid-cols-[250px_1fr_280px]">
      <aside className="card space-y-2 p-4">
        <h3 className="font-semibold">Task Flow</h3>
        {run.taskResponses.map((task, i) => (
          <p key={task.id} className={task.isComplete ? "text-emerald-400" : "text-zinc-300"}>{i + 1}. {task.podTask.title}</p>
        ))}
      </aside>

      <section className="card space-y-4 p-6">
        <h1 className="text-2xl font-semibold">{run.outcomePod.title}</h1>
        <p className="text-zinc-400">Mission Brief: {run.outcomePod.shortDescription}</p>
        <div className="rounded-md border border-zinc-700 p-4">
          <h2 className="font-medium">Current Task: {activeTask.podTask.title}</h2>
          <p className="mt-1 text-sm text-zinc-300">{activeTask.podTask.prompt}</p>
          <p className="mt-2 text-xs text-zinc-500">{activeTask.podTask.instructions}</p>
        </div>

        <form action={saveTaskFoundation} className="space-y-3">
          <input type="hidden" name="taskResponseId" value={activeTask.id} />
          <label className="text-sm">Attempt</label>
          <Textarea name="attemptText" defaultValue={activeTask.attemptText} required />
          <label className="text-sm">Reasoning</label>
          <Textarea name="reasoningText" defaultValue={activeTask.reasoningText} required />
          <label className="text-sm">Goal</label>
          <Textarea name="goalText" defaultValue={activeTask.goalText} required />
          <label className="text-sm">Constraints</label>
          <Textarea name="constraintsText" defaultValue={activeTask.constraintsText} required />
          <label className="text-sm">Definition of Done</label>
          <Textarea name="definitionOfDoneText" defaultValue={activeTask.definitionOfDoneText} required />
          <Button type="submit">Save Attempt + Spec</Button>
        </form>

        <form action={async () => { "use server"; await unlockAI(activeTask.id); }}>
          <Button type="submit" className="bg-zinc-700">Unlock AI</Button>
        </form>

        <div className="rounded-md border border-zinc-700 p-4">
          <h3 className="font-medium">AI Output</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{activeTask.aiOutputText ?? "AI is locked. Submit Attempt + Spec first."}</p>
        </div>

        <form action={submitVerification} className="space-y-3">
          <input type="hidden" name="taskResponseId" value={activeTask.id} />
          <label className="text-sm">Verification Decision</label>
          <select name="verificationDecision" className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2">
            <option value="ACCEPT">Accept</option>
            <option value="MODIFY">Modify</option>
            <option value="REJECT">Reject</option>
          </select>
          <label className="text-sm">Why?</label>
          <Textarea name="verificationExplanation" defaultValue={activeTask.verificationExplanation ?? ""} required />
          <label className="text-sm">Final Result</label>
          <Textarea name="finalAnswerText" defaultValue={activeTask.finalAnswerText ?? ""} required />
          <Button type="submit">Submit Verification + Finalize</Button>
        </form>
      </section>

      <aside className="card space-y-3 p-4 text-sm">
        <h3 className="font-semibold">Run Summary</h3>
        <p>Status: {run.status}</p>
        <p>Completed Tasks: {run.taskResponses.filter((t) => t.isComplete).length}/{run.taskResponses.length}</p>
        <p>Score Events: {run.scoreEvents.length}</p>
        <div className="rounded-md border border-zinc-700 p-3 text-xs text-zinc-400">
          Rules: Think first. Specify clearly. AI is advisory. Verification is required.
        </div>
      </aside>
    </main>
  );
}
