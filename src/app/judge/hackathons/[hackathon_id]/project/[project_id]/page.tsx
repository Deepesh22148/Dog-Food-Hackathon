"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import judgeService from "@/app/judge/judgeService";
import {
  ArrowLeft,
  ExternalLink,
  Code2,
  CheckCircle2,
  Loader2,
  Users,
  Tag,
  Star,
  MessageSquare,
  Award,
  AlertCircle,
} from "lucide-react";

export const reviewFormSchema = z.object({
  scores: z.record(
    z.string(),
    z
      .number()
      .int()
      .min(1, "Score must be at least 1")
      .max(5, "Score cannot exceed 5"),
  ),
  comment: z
    .string()
    .trim()
    .max(5000, "Comment cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface PageProps {
  params: Promise<{
    hackathon_id: string;
    project_id: string;
  }>;
}

interface Criterion {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  position: number;
}

interface ReviewScore {
  criterion_id: string;
  value: number;
}

interface Review {
  id: string;
  judge_id: string;
  project_id: string;
  comment?: string | null;
  status: "DRAFT" | "SUBMITTED";
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  scores: ReviewScore[];
}

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  repository_url?: string | null;
  demo_url?: string | null;
  submitted_at?: string | null;

  track?: {
    id: string;
    name: string;
  } | null;

  team?: {
    id: string;
    name: string;
  } | null;

  hackathon: {
    id: string;
    title: string;
    phase: string;
    judging_start: string;
    judging_end: string;
    criteria: Criterion[];
  };

  criteria: Criterion[];
  review: Review | null;
  isSubmitted: boolean;
}

const Page = ({ params }: PageProps) => {
  const { hackathon_id, project_id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      scores: {},
      comment: "",
    },
  });

  const scores = watch("scores");

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);

        const response = await judgeService.getProjectInfo(
          project_id,
          hackathon_id,
        );

        if (!isMounted) return;

        if (response?.success && response?.data) {
          const rawData = response.data;
          const criteriaList = rawData.criteria || rawData.hackathon?.criteria || [];

          setProject({
            id: rawData.project.id,
            title: rawData.project.title,
            description: rawData.project.description,
            repository_url: rawData.project.repository_url,
            demo_url: rawData.project.demo_url,
            submitted_at: rawData.project.submitted_at ?? null,
            track: rawData.project.track ?? rawData.track ?? null,
            team: rawData.project.team ?? rawData.team ?? null,
            hackathon: rawData.hackathon,
            criteria: criteriaList,
            review: rawData.review ?? null,
            isSubmitted: rawData.isSubmitted ?? false,
          });

          // Pre-fill form values if draft or existing review scores exist
          if (rawData.review?.scores && Array.isArray(rawData.review.scores)) {
            const initialScores: Record<string, number> = {};
            rawData.review.scores.forEach((s: ReviewScore) => {
              if (s.criterion_id && typeof s.value === "number") {
                initialScores[s.criterion_id] = s.value;
              }
            });

            reset({
              scores: initialScores,
              comment: rawData.review.comment || "",
            });
          }
        } else {
          setProject(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load project review details:", error);

        toast.add({
          title: "Failed to load project",
          description: "Please try again later.",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [hackathon_id, project_id, reset]);

  const validateAndOpenConfirmation = (values: ReviewFormValues) => {
    if (!project) return;

    const missingCriterion = project.criteria.find(
      (criterion) =>
        values.scores[criterion.id] === undefined ||
        values.scores[criterion.id] === null,
    );

    if (missingCriterion) {
      toast.add({
        title: "Incomplete evaluation",
        description: `Please select a score for "${missingCriterion.name}".`,
      });
      return;
    }

    setShowConfirmation(true);
  };

  const submitReview = async (values: ReviewFormValues) => {
    if (!project) return;

    setSubmitting(true);

    try {
      const payload = {
        project_id,
        scores: values.scores,
        comment: values.comment?.trim() || "",
      };

      const response = await judgeService.submitReview(hackathon_id, payload);

      if (response?.success) {
        toast.add({
          title: "Review submitted",
          description: "Your scores and feedback have been successfully saved.",
        });
        router.push(`/judge/hackathons/${hackathon_id}`);
      } else {
        toast.add({
          title: "Submission failed",
          description: response?.error?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.add({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#888888]" />
          <p className="text-xs text-[#888888]">Loading project review details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-center text-[#E0E0E0]">
          <CardContent className="space-y-4 p-8">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#EDEDED]">Project Not Found</h2>
              <p className="text-xs text-[#888888]">
                Project details could not be retrieved or you do not have permission to review it.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] hover:bg-[#282828]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const isSubmitted = project.review?.status === "SUBMITTED";

  return (
    <div className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation & Header */}
        <header className="flex flex-col gap-3 border-b border-[#282828] pb-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="w-fit border-[#282828] bg-[#181818] text-xs text-[#E0E0E0] transition-colors hover:bg-[#282828] hover:text-[#FFFFFF]"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Projects
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#888888]" />
                <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                  Project Evaluation
                </h1>
              </div>
              <p className="mt-1 text-xs text-[#888888]">
                Review submission details and submit scores based on established hackathon criteria.
              </p>
            </div>

            {isSubmitted && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Review Submitted
              </span>
            )}
          </div>
        </header>

        {/* Project Details Card */}
        <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
          <CardHeader className="border-b border-[#282828] pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardTitle className="text-xl font-bold text-[#EDEDED]">
                {project.title}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-2">
                {project.track && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-xs text-[#888888]">
                    <Tag className="h-3 w-3" />
                    {project.track.name}
                  </span>
                )}
                {project.team && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-xs text-[#888888]">
                    <Users className="h-3 w-3" />
                    {project.team.name}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#EDEDED]/90">
              {project.description}
            </p>

            {/* Links */}
            {(project.repository_url || project.demo_url) && (
              <div className="flex flex-wrap gap-2 border-t border-[#282828] pt-3">
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#121212] px-3 py-1.5 text-xs text-[#EDEDED] transition-colors hover:bg-[#282828]"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    Repository
                    <ExternalLink className="h-3 w-3 text-[#888888]" />
                  </a>
                )}

                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#121212] px-3 py-1.5 text-xs text-[#EDEDED] transition-colors hover:bg-[#282828]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Demo
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SUBMITTED REVIEW (Read-only mode) */}
        {isSubmitted ? (
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Submitted Ratings
                </CardTitle>
              </div>
              <p className="text-xs text-[#888888]">
                Your scores and feedback have been finalized for this project.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {project.criteria.map((criterion) => {
                  const score = project.review?.scores.find(
                    (item) => item.criterion_id === criterion.id,
                  );
                  return (
                    <div
                      key={criterion.id}
                      className="flex items-center justify-between rounded-lg border border-[#282828] bg-[#121212] p-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-[#EDEDED]">{criterion.name}</p>
                        <p className="text-[11px] text-[#888888]">Weight: {criterion.weight}</p>
                      </div>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#282828] bg-[#181818] font-bold text-[#EDEDED]">
                        {score?.value ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {project.review?.comment && (
                <div className="rounded-lg border border-[#282828] bg-[#121212] p-4 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-[#EDEDED]">
                    <MessageSquare className="h-3.5 w-3.5 text-[#888888]" />
                    <span>Overall Feedback</span>
                  </div>
                  <p className="whitespace-pre-wrap text-[#888888] leading-relaxed">
                    {project.review.comment}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* INTERACTIVE EVALUATION FORM */
          <form
            onSubmit={handleSubmit(validateAndOpenConfirmation)}
            className="space-y-6"
          >
            {/* Criteria scoring */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#EDEDED]">Judging Criteria</h2>
                <p className="text-xs text-[#888888]">
                  Rate the project on a scale from 1 (Poor) to 5 (Excellent) for each criterion.
                </p>
              </div>

              <div className="grid gap-4">
                {project.criteria.map((criterion) => {
                  const currentScore = scores?.[criterion.id];

                  return (
                    <Card
                      key={criterion.id}
                      className="border-[#282828] bg-[#181818] text-[#E0E0E0]"
                    >
                      <CardContent className="space-y-4 pt-5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-[#EDEDED]">
                              {criterion.name}
                            </h3>
                            {criterion.description && (
                              <p className="mt-1 text-xs text-[#888888]">
                                {criterion.description}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-[11px] font-medium text-[#888888]">
                            Weight: {criterion.weight}
                          </span>
                        </div>

                        {/* Score options 1 to 5 */}
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((score) => {
                            const isSelected = currentScore === score;

                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() =>
                                  setValue(`scores.${criterion.id}`, score, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  })
                                }
                                className={`flex h-11 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                                  isSelected
                                    ? "border-[#EDEDED] bg-[#EDEDED] text-[#121212]"
                                    : "border-[#282828] bg-[#121212] text-[#EDEDED] hover:bg-[#282828]"
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>

                        {currentScore === undefined && (
                          <p className="text-[11px] text-[#888888]">
                            Please select a score from 1 to 5.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Overall Feedback */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardContent className="space-y-2 pt-5">
                <label
                  htmlFor="comment"
                  className="flex items-center justify-between text-xs font-semibold text-[#EDEDED]"
                >
                  <span>Overall Feedback</span>
                  <span className="font-normal text-[#888888]">(Optional)</span>
                </label>

                <textarea
                  id="comment"
                  rows={4}
                  maxLength={5000}
                  placeholder="Provide constructive feedback or explanations for your scoring..."
                  {...register("comment")}
                  className="w-full rounded-md border border-[#282828] bg-[#121212] p-3 text-xs text-[#EDEDED] outline-none transition-colors placeholder:text-[#555555] focus:border-[#555555]"
                />

                {errors.comment && (
                  <p className="text-xs text-red-400">{errors.comment.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Form actions */}
            <div className="flex justify-end border-t border-[#282828] pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
              >
                Review & Submit
              </Button>
            </div>
          </form>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-4">
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Submit Final Evaluation?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-xs leading-relaxed text-[#888888]">
                  Once submitted, your scores and feedback will be saved and cannot be modified. Please verify your ratings before confirming.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmation(false)}
                    disabled={submitting}
                    className="border-[#282828] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828]"
                  >
                    Go Back
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmit(submitReview)}
                    disabled={submitting}
                    className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Confirm Submit"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;