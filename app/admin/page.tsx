import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/app");

  const [users, pods, runs] = await Promise.all([
    prisma.user.count(),
    prisma.outcomePod.count(),
    prisma.podRun.count(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-semibold">Seed Overview</h1>
      <div className="card space-y-2 p-6">
        <p>Users: {users}</p>
        <p>Outcome Pods: {pods}</p>
        <p>Pod Runs: {runs}</p>
      </div>
    </main>
  );
}
