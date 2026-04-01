import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-6 py-10">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <div className="card p-6">
        <p>Name: {session.user.name}</p>
        <p>Email: {session.user.email}</p>
        <p>Thinking: {profile?.thinkingScore ?? 0}</p>
        <p>Specification: {profile?.specScore ?? 0}</p>
        <p>Verification: {profile?.verificationScore ?? 0}</p>
      </div>
    </main>
  );
}
