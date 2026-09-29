import "server-only";
import prismaClient from "@/app/lib/prisma/prismaClient";

export async function hasAcceptedJudgeEntry(userId: string) {
  const entry = await prismaClient.hackathonJudge.findFirst({
    where: {
      user_id: userId,
      status: "ACCEPTED",
    },
    select: {
      id: true,
    },
  });

  return Boolean(entry);
}