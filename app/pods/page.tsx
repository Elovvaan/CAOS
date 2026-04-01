import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getPublishedPods } from "@/server/pods";

export default async function PublicPodsPage() {
  const pods = await getPublishedPods();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Outcome Pods</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {pods.map((pod) => (
          <Card key={pod.id}>
            <h2 className="font-semibold">{pod.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{pod.shortDescription}</p>
            <p className="mt-2 text-xs text-zinc-500">{pod.difficulty} · {pod.estimatedMinutes} min</p>
            <Link href={`/pods/${pod.slug}`} className="mt-3 inline-block text-sm text-accent">Mission brief</Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
