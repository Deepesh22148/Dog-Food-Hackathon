import crypto from "crypto";
import { cookies } from "next/headers";

import prismaClient from "@/app/lib/prisma/prismaClient";

const invalidateSession = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex");

  await prismaClient.session.deleteMany({
    where: {
      token_hash: tokenHash,
    },
  });

  cookieStore.delete("session_token");
};

export { invalidateSession };