import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import { UserRole } from "../generated/prisma/enums";
import { requireJudge } from "@/lib/auth/requireJudge";


export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireJudge();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PARTICIPANT") {
    redirect("/unauthorized");
  } 

  return <div className="bg-black text-white">{children}</div>;
}