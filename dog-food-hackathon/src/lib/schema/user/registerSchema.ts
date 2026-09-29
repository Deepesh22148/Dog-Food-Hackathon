import z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(30, "Name cannot exceed 30 characters"),
    email: z.email("Invalid email address"),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9]{10,12}$/,
        "Phone number must contain 10 to 12 digits and optional '+' prefix",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password cannot exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain an uppercase letter, lowercase letter, number, and special character",
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
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
