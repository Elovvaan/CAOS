import { prisma } from "@/lib/prisma";

export async function getPublishedPods() {
  return prisma.outcomePod.findMany({
    where: { status: "PUBLISHED" },
    include: { tasks: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPodBySlug(slug: string) {
  return prisma.outcomePod.findUnique({ where: { slug }, include: { tasks: { orderBy: { position: "asc" } } } });
}
