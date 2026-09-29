import crypto from "crypto";
import { cookies } from "next/headers";
import prismaClient from "@/app/lib/prisma/prismaClient";

const SESSION_DURATION =
  Number(process.env.SESSION_DURATION_DAYS) * 24 * 60 * 60 * 1000;

const createSession = async (userId: string) => {
  const sessionToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex");
    
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await prismaClient.session.create({
    data: { user_id: userId , token_hash: tokenHash, expires_at: expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
};
export { createSession };
