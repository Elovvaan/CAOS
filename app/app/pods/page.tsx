import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { getPublishedPods } from "@/server/pods";

export default async function AppPodsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const pods = await getPublishedPods();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-5 text-3xl font-semibold">Outcome Pods</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {pods.map((pod) => (
          <Card key={pod.id}>
            <h2 className="font-semibold">{pod.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{pod.shortDescription}</p>
            <p className="mt-2 text-xs text-zinc-500">{pod.difficulty} · {pod.estimatedMinutes} min</p>
            <Link href={`/app/pods/${pod.slug}`} className="mt-3 inline-block text-sm text-accent">View mission</Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
