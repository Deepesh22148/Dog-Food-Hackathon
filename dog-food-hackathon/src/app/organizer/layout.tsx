import { redirect } from "next/navigation";
import { UserRole } from "../generated/prisma/enums";
import { requireUserWithRole } from "@/lib/auth/requireUserWithRole";

const ALLOWED_USERS = [UserRole.PARTICIPANT];

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserWithRole(ALLOWED_USERS);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PARTICIPANT" && user.is_organizer == false) {
    redirect("/unauthorized");
  } 

  return <>{children}</>;
}