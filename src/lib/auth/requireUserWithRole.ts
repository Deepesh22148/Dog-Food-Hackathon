import { UserRole } from "@/app/generated/prisma/enums";
import { getCurrentUser } from "./getCurrentUser";
import { redirect } from "next/navigation";

export async function requireUserWithRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}
