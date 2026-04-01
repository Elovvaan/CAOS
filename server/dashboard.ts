import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const [profile, activeRuns, recentScores, badges, pods] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.podRun.findMany({ where: { userId, status: { in: ["IN_PROGRESS", "NOT_STARTED"] } }, include: { outcomePod: true } }),
    prisma.scoreEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.outcomePod.findMany({ where: { status: "PUBLISHED" }, take: 3 }),
  ]);
  return { profile, activeRuns, recentScores, badges, pods };
}
