import z from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http(s) URL");

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Describe your project in at least 10 characters")
    .max(5000),
  repository_url: optionalUrl,
  demo_url: optionalUrl,
  track_id: z.string().optional(),
});

export type ProjectFormValues = z.input<typeof projectSchema>;