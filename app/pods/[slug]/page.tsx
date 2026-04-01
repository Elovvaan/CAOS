import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getPodBySlug } from "@/server/pods";

export default async function PublicPodDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pod = await getPodBySlug(slug);
  if (!pod) return notFound();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-semibold">{pod.title}</h1>
      <p className="text-zinc-300">{pod.fullDescription}</p>
      <Card>
        <p>{pod.difficulty} · {pod.estimatedMinutes} min · {pod.tasks.length} tasks</p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-zinc-300">
          {(pod.learningObjectives as string[]).map((o) => <li key={o}>{o}</li>)}
        </ul>
      </Card>
      <Link href="/sign-up" className="inline-block rounded-md bg-accent px-4 py-2">Start this mission</Link>
    </main>
  );
}
