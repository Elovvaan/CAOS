import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, ShieldCheck, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getPublishedPods } from "@/server/pods";

const loop = ["Attempt", "Specify", "Use AI", "Verify", "Refine"];

export default async function LandingPage() {
  const pods = await getPublishedPods();

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
      <section className="space-y-6 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Cognitive × AI Operating System</p>
        <h1 className="text-4xl font-semibold">Think First. Then Direct Intelligence.</h1>
        <p className="max-w-2xl text-zinc-300">CAOS trains you to use AI without becoming dependent on it.</p>
        <div className="flex gap-3">
          <Link href="/sign-up" className="rounded-md bg-accent px-5 py-2 font-medium">Start Training</Link>
          <Link href="/pods" className="rounded-md border border-zinc-700 px-5 py-2">Explore Pods</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Most users jump to AI before they think.",
          "AI output can look correct and still be wrong.",
          "Skipping reasoning creates dependence.",
        ].map((item) => (
          <Card key={item}><p className="text-zinc-300">{item}</p></Card>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Core Loop</h2>
        <div className="grid gap-3 md:grid-cols-5">{loop.map((s) => <Card key={s} className="text-center">{s}</Card>)}</div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Featured Outcome Pods</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pods.map((pod) => (
            <Card key={pod.id}>
              <h3 className="text-lg font-medium">{pod.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{pod.shortDescription}</p>
              <Link href={`/pods/${pod.slug}`} className="mt-4 inline-flex items-center text-sm text-accent">View pod <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card><Brain className="mb-2" />Thinking Score</Card>
        <Card><Target className="mb-2" />Specification Score</Card>
        <Card><ShieldCheck className="mb-2" />Verification Score</Card>
      </section>

      <section className="rounded-xl border border-zinc-800 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-2" />
        <h2 className="text-2xl font-semibold">Train cognition before automation.</h2>
        <Link href="/sign-up" className="mt-4 inline-block rounded-md bg-accent px-5 py-2 font-medium">Start Training</Link>
      </section>
    </main>
  );
}
