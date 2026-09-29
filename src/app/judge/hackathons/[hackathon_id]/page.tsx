"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import judgeService from "@/app/judge/judgeService";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Award,
  FolderGit2,
  ExternalLink,
  Code2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Tag,
  Gavel,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

interface Track {
  id: string;
  name: string;
}

interface Criterion {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  position: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  repository_url?: string | null;
  demo_url?: string | null;
  submitted_at?: string | null;
  track_id?: string | null;
}

interface HackathonDetails {
  id: string;
  title: string;
  description?: string | null;
  phase: string;
  judging_start: string;
  judging_end: string;
  tracks: Track[];
  criteria: Criterion[];
  assignedTrackIds: string[];
  projects: Project[];
  isSubmitted: boolean;
}

const formatDate = (value: string) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [record, setRecord] = useState<HackathonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJudgingOpen, setIsJudgingOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadHackathon = async () => {
      try {
        setLoading(true);

        const response = await judgeService.getHackathonDetails(hackathon_id);

        if (!isMounted) return;

        if (response?.success && response.data) {
          const data = response.data;
          setRecord(data);

          // Evaluate judging window safely on client side
          const now = new Date();
          const start = new Date(data.judging_start);
          const end = new Date(data.judging_end);
          setIsJudgingOpen(now >= start && now <= end);
        } else {
          setRecord(null);
          toast.add({
            title: response?.error?.code ?? "Failed to fetch hackathon",
            description: response?.error?.message ?? "An unexpected error occurred.",
          });
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to fetch assigned hackathon:", error);

        toast.add({
          title: "Internal server error",
          description: "Could not load hackathon details.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHackathon();

    return () => {
      isMounted = false;
    };
  }, [hackathon_id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#888888]" />
          <p className="text-xs text-[#888888]">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-center text-[#E0E0E0]">
          <CardContent className="space-y-4 p-8">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#EDEDED]">Hackathon Not Found</h2>
              <p className="text-xs text-[#888888]">
                Details for this hackathon could not be loaded or you lack access permissions.
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

  const assignedTrackIds = record.assignedTrackIds ?? [];
  const tracks = record.tracks ?? [];
  const criteria = record.criteria ?? [];
  const projects = record.projects ?? [];

  const assignedTracks = tracks.filter((track) =>
    assignedTrackIds.includes(track.id)
  );

  return (
    <main className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-6xl space-y-6">
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
            Back to Judge Hackathons
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-[#888888]" />
                <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                  {record.title}
                </h1>
              </div>
              <p className="mt-1 text-xs text-[#888888]">
                Review assigned tracks, judging criteria, and submit evaluations for hackathon projects.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#282828] bg-[#181818] px-3 py-1 text-xs font-medium text-[#EDEDED]">
                Phase: {record.phase}
              </span>
              {isJudgingOpen ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Judging Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/60 bg-amber-950/20 px-3 py-1 text-xs font-medium text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  Window Closed
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Overview & Judging Schedule */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0] md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#888888]">
                Hackathon Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#EDEDED]">
                {record.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-[#888888]">
                <Calendar className="h-4 w-4" />
                Judging Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-[#888888]">Starts:</span>
                <p className="font-semibold text-[#EDEDED]">
                  {formatDate(record.judging_start)}
                </p>
              </div>
              <div className="border-t border-[#282828] pt-2">
                <span className="text-[#888888]">Ends:</span>
                <p className="font-semibold text-[#EDEDED]">
                  {formatDate(record.judging_end)}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {!isJudgingOpen && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-900/60 bg-amber-950/20 p-3.5 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>
              The judging window is currently closed. Projects can be viewed, but scoring submissions may be restricted.
            </p>
          </div>
        )}

        {/* Assigned Tracks */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#888888]" />
            <h2 className="text-base font-semibold text-[#EDEDED]">Your Assigned Tracks</h2>
          </div>

          {assignedTracks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedTracks.map((track) => (
                <span
                  key={track.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#181818] px-3 py-1.5 text-xs text-[#EDEDED]"
                >
                  <Tag className="h-3 w-3 text-[#888888]" />
                  {track.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#888888]">
              No specific tracks have been assigned to your profile.
            </p>
          )}
        </section>

        {/* Judging Criteria */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#888888]" />
            <h2 className="text-base font-semibold text-[#EDEDED]">Evaluation Criteria</h2>
          </div>

          {criteria.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {criteria.map((criterion) => (
                <Card
                  key={criterion.id}
                  className="border-[#282828] bg-[#181818] text-[#E0E0E0]"
                >
                  <CardContent className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-[#EDEDED]">
                        {criterion.name}
                      </h3>
                      <span className="rounded-full border border-[#282828] bg-[#121212] px-2 py-0.5 text-[10px] text-[#888888]">
                        Weight: {criterion.weight}
                      </span>
                    </div>

                    {criterion.description && (
                      <p className="text-[11px] leading-normal text-[#888888]">
                        {criterion.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#888888]">
              No judging criteria have been configured for this hackathon yet.
            </p>
          )}
        </section>

        {/* Assigned Projects */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3 border-b border-[#282828] pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-[#888888]" />
              <h2 className="text-base font-semibold text-[#EDEDED]">Projects to Review</h2>
            </div>
            <span className="text-xs text-[#888888]">
              {projects.length} project{projects.length === 1 ? "" : "s"} total
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => {
                const projectTrack = tracks.find((t) => t.id === project.track_id);

                return (
                  <Card
                    key={project.id}
                    className="flex flex-col justify-between border-[#282828] bg-[#181818] text-[#E0E0E0]"
                  >
                    <div>
                      <CardHeader className="border-b border-[#282828] pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold text-[#EDEDED]">
                            {project.title}
                          </CardTitle>
                          {projectTrack && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-[10px] text-[#888888]">
                              <Tag className="h-2.5 w-2.5" />
                              {projectTrack.name}
                            </span>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-3 space-y-3">
                        <p className="line-clamp-3 text-xs leading-relaxed text-[#888888]">
                          {project.description}
                        </p>

                        {(project.repository_url || project.demo_url) && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {project.repository_url && (
                              <a
                                href={project.repository_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-[#282828] bg-[#121212] px-2 py-1 text-[11px] text-[#EDEDED] transition-colors hover:bg-[#282828]"
                              >
                                <Code2 className="h-3 w-3" />
                                Repo
                              </a>
                            )}
                            {project.demo_url && (
                              <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-[#282828] bg-[#121212] px-2 py-1 text-[11px] text-[#EDEDED] transition-colors hover:bg-[#282828]"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Demo
                              </a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <CardFooter className="border-t border-[#282828] pt-3">
                      <Link
                        href={`/judge/hackathons/${hackathon_id}/project/${project.id}`}
                        className="w-full"
                      >
                        <Button
                          size="sm"
                          className="w-full bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
                        >
                          Review Project
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardContent className="p-8 text-center">
                <FolderGit2 className="mx-auto h-8 w-8 text-[#282828]" />
                <p className="mt-2 text-xs text-[#888888]">
                  {isJudgingOpen
                    ? "There are no submitted projects in your assigned tracks yet."
                    : "No projects are available to review right now."}
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
};

export default Page;