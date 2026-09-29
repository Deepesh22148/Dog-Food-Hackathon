import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import crypto from "crypto";
import prismaClient from "@/app/lib/prisma/prismaClient";

const SESSION_COOKIE_NAME = "session_token";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prismaClient.session.findUnique({
    where: { token_hash: tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          bio: true,
          phone: true,
          email: true,
          address: true,
          role: true,
          organization: true,
          linkedinUrl: true,
          gitUrl: true,
          created_at: true,
          updated_at: true,
          is_organizer: true,
        },
      },
    },
  });
  if (!session) {
    return null;
  }

  if (session.expires_at < new Date()) {
    await prismaClient.session
      .delete({ where: { id: session.id } })
      .catch(() => {});
    return null;
  }

  return session.user;
});
