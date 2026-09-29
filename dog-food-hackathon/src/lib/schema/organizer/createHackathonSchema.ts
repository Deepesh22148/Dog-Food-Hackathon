import z from "zod";

export const createHackathonSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters"),

    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    registration_start: z.coerce.date({
      error: "Invalid registration start date",
    }),

    registration_end: z.coerce.date({
      error: "Invalid registration end date",
    }),

    submission_deadline: z.coerce.date({
      error: "Invalid submission deadline",
    }),

    judging_start: z.coerce.date({
      error: "Invalid judging start date",
    }),

    judging_end: z.coerce.date({
      error: "Invalid judging end date",
    }),

    tracks: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Track name cannot be empty")
          .max(100, "Track name cannot exceed 100 characters"),
      )
      .min(1, "At least one track is required"),

    prizes: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(1, "Prize name is required")
            .max(100, "Prize name cannot exceed 100 characters"),

          description: z
            .string()
            .trim()
            .max(500, "Prize description cannot exceed 500 characters")
            .optional(),

          value: z
            .string()
            .trim()
            .refine(
              (value) => value === "" || /^\d+$/.test(value),
              "Prize amount must be a whole number",
            )
            .optional(),
        }),
      )
      .default([]),
    max_team_size: z
      .number()
      .int("Team size must be a whole number")
      .min(1, "Team size must be at least 1")
      .max(20, "Team size cannot exceed 20"),

    min_team_size: z
      .number()
      .int("Team size must be a whole number")
      .min(1, "Team size must be at least 1")
      .max(20, "Team size cannot exceed 20"),
    criteria: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(1, "Criterion name is required")
            .max(100, "Criterion name cannot exceed 100 characters"),

          description: z
            .string()
            .trim()
            .max(500, "Criterion description cannot exceed 500 characters")
            .optional(),

          weight: z.coerce
            .number()
            .min(1, "Weight must be at least 1")
            .max(100, "Weight cannot exceed 100"),

          position: z.coerce
            .number()
            .int()
            .min(0, "Position cannot be negative"),
        }),
      )
      .min(1, "At least one judging criterion is required"),
  })
  .superRefine((data, ctx) => {
    if (data.registration_start >= data.registration_end) {
      ctx.addIssue({
        code: "custom",
        path: ["registration_end"],
        message: "Registration end must be after registration start",
      });
    }

    if (data.max_team_size <= data.min_team_size) {
      ctx.addIssue({
        code: "custom",
        path: ["max_team_size"],
        message: "Maximum team size must be greater than minimum team size",
      });
    }
    if (data.registration_end >= data.submission_deadline) {
      ctx.addIssue({
        code: "custom",
        path: ["submission_deadline"],
        message: "Submission deadline must be after registration end",
      });
    }

    if (data.submission_deadline >= data.judging_start) {
      ctx.addIssue({
        code: "custom",
        path: ["judging_start"],
        message: "Judging must start after the submission deadline",
      });
    }

    if (data.judging_start >= data.judging_end) {
      ctx.addIssue({
        code: "custom",
        path: ["judging_end"],
        message: "Judging end must be after judging start",
      });
    }

    const totalWeight = data.criteria.reduce(
      (total, criterion) => total + criterion.weight,
      0,
    );

    if (totalWeight !== 100) {
      ctx.addIssue({
        code: "custom",
        path: ["criteria"],
        message: `Criterion weights must total 100. Current total: ${totalWeight}`,
      });
    }
  });
