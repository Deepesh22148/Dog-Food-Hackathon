import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import prismaClient from "@/app/lib/prisma/prismaClient";

export async function requireJudge() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isJudge = await prismaClient.hackathonJudge.findFirst({
    where: {
      user_id: user.id,
      status: "ACCEPTED",
    },
    select: {
      id: true,
    },
  });

  if (!isJudge) {
    redirect("/unauthorized");
  }

  return {
    ...user,
    is_judge: true,
  };
}