import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import z from "zod";
import prismaClient from "@/app/lib/prisma/prismaClient";
import { registerSchema } from "@/lib/schema/user/registerSchema";
import { Prisma } from "@/app/generated/prisma/client";
import { createSession } from "@/lib/auth/createSession";
type RegisterForm = z.infer<typeof registerSchema>;
export type RegisterResult =
  | { success: true; user: { id: string; name: string; email: string } }
  | {
      success: false;
      error: "VALIDATION_ERROR" | "USER_ALREADY_EXISTS" | "INTERNAL_ERROR";
    };
const scrypt = promisify(scryptCallback);

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
};

const registerUser = async (payload: RegisterForm): Promise<RegisterResult> => {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "VALIDATION_ERROR" };
  }
  const { name, phone, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return { success: false, error: "USER_ALREADY_EXISTS" };
    }
    const password_hash = await hashPassword(password);
    const user = await prismaClient.user.create({
      data: { name, phone, email, password_hash },
      select: { id: true, name: true, email: true , role : true},
    });
    // P => Participant , O => Organizer , A => Admin, J => Judge
    await createSession(user.id);
    return { success: true, user };
  } catch (error : any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "USER_ALREADY_EXISTS" };
    }
    console.error("registerUser failed:", error);
    return { success: false, error: "INTERNAL_ERROR" };
  }
};
export default registerUser;
