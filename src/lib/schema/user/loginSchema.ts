import z from "zod";

export const loginSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters")
  });

// model User {
//   id            String   @id @default(uuid())
//   name          String   @db.Text
//   bio           String?  @db.Text
//   password_hash String   @db.Text
//   phone         String   @db.Text
//   email         String   @unique @db.Text
//   address       String?  @db.Text
//   role          UserRole @default(PARTICIPANT)
//   organization  String?  @db.Text
//   linkedinUrl   String?  @db.Text
//   gitUrl        String?  @db.Text
//   created_at    DateTime @default(now())
//   updated_at    DateTime @updatedAt

//   userSkills UserSkill[]

//   sessions Session[]
// }
