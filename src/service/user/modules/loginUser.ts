import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import z from "zod";
import prismaClient from "@/app/lib/prisma/prismaClient";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import { createSession } from "@/lib/auth/createSession";
import { loginSchema } from "@/lib/schema/user/loginSchema";
type LoginForm = z.infer<typeof loginSchema>;

export type LoginResult =
  | { success: true; user: { id: string; name: string; email: string , role : UserRole } }
  | {
      success: false;
      error: "VALIDATION_ERROR" | "INVALID_CREDENTIALS" | "INTERNAL_ERROR";
    };

const scrypt = promisify(scryptCallback);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  storedPasswordHash: string,
): Promise<boolean> => {
  const [salt, storedKeyHex] = storedPasswordHash.split(":");

  if (!salt || !storedKeyHex) {
    return false;
  }

  const storedKey = Buffer.from(storedKeyHex, "hex");

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
};

const loginUser = async (payload: LoginForm): Promise<LoginResult> => {
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, error: "VALIDATION_ERROR" };
  }
  const { password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true, password_hash: true, name: true , role : true},
    });
    if (!existingUser) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }

    const passwordValid = await verifyPassword(
      password,
      existingUser.password_hash,
    );
    if (!passwordValid) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }
    await createSession(existingUser.id);

    return {
      success: true,
      user: {
        id: existingUser.id,
        email: email,
        name: existingUser.name,
        role : existingUser.role
      },
    };
  } catch (error: any) {
    console.error("login failed:", error);
    return { success: false, error: "INTERNAL_ERROR" };
  }
};
export default loginUser;
