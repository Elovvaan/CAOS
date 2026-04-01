import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/server/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const data = await getDashboardData(session.user.id);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Welcome back, {session.user.name}</h1>
        <p className="mt-2 text-zinc-400">Level {data.profile?.level ?? 1} · XP {data.profile?.xp ?? 0} · Streak {data.profile?.streak ?? 0}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>Thinking Score: {data.profile?.thinkingScore ?? 0}</Card>
        <Card>Spec Score: {data.profile?.specScore ?? 0}</Card>
        <Card>Verification Score: {data.profile?.verificationScore ?? 0}</Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Active Pod Runs</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.activeRuns.length === 0 ? <p className="text-zinc-500">No active runs yet.</p> : data.activeRuns.map((run) => (
              <Link key={run.id} className="block text-accent" href={`/app/runs/${run.id}`}>{run.outcomePod.title}</Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Recommended Pods</h2>
          <div className="mt-3 space-y-2 text-sm">{data.pods.map((pod) => <Link key={pod.id} href={`/app/pods/${pod.slug}`} className="block text-accent">{pod.title}</Link>)}</div>
        </Card>
        <Card>
          <h2 className="font-semibold">Recent Activity</h2>
          <div className="mt-3 space-y-2 text-sm">{data.recentScores.slice(0, 5).map((event) => <p key={event.id}>{event.category}: +{event.value}</p>)}</div>
        </Card>
        <Card>
          <h2 className="font-semibold">Earned Badges</h2>
          <div className="mt-3 space-y-2 text-sm">{data.badges.length ? data.badges.map((b) => <p key={b.id}>{b.badge.name}</p>) : <p className="text-zinc-500">No badges yet.</p>}</div>
        </Card>
      </section>
    </main>
  );
}
