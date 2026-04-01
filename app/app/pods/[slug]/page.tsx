import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPodBySlug } from "@/server/pods";
import { startPodRun } from "@/server/actions";

export default async function AppPodDetail({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const { slug } = await params;
  const pod = await getPodBySlug(slug);
  if (!pod) redirect("/app/pods");

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-semibold">{pod.title}</h1>
      <p className="text-zinc-300">{pod.shortDescription}</p>
      <Card>
        <p>{pod.fullDescription}</p>
        <p className="mt-3 text-sm text-zinc-500">{pod.difficulty} · {pod.estimatedMinutes} min · {pod.tasks.length} tasks</p>
      </Card>
      <form action={startPodRun.bind(null, pod.slug)}>
        <Button type="submit">Start Pod Run</Button>
      </form>
    </main>
  );
}
