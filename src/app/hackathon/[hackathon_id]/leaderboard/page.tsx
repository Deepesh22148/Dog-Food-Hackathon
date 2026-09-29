"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import hackathonService from "../../hackathonService";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  BarChart3,
  Star,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

interface CriterionScore {
  criterion_id: string;
  name: string;
  weight: number;
  average: number;
}

interface LeaderboardProject {
  project_id: string;
  project_title: string;
  team: {
    id: string;
    name: string;
  };
  track: {
    id: string;
    name: string;
  } | null;
  review_count: number;
  criterion_scores: CriterionScore[];
  final_score: number;
  rank: number;
}

interface LeaderboardDetails {
  my_rank: LeaderboardProject | null;
  leaderboard: LeaderboardProject[];
}

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [record, setRecord] = useState<LeaderboardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        const response = await hackathonService.getLeaderboard(hackathon_id);

        if (!isMounted) return;

        if (response?.success && response.data) {
          setRecord(response.data);
        } else {
          setRecord(null);
          toast.add({
            title: response?.error?.code ?? "Failed to fetch leaderboard",
            description: response?.error?.message ?? "An unexpected error occurred.",
          });
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to fetch leaderboard:", error);

        toast.add({
          title: "Internal server error",
          description: "Could not load leaderboard.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [hackathon_id]);

  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400">
          <Trophy className="h-5 w-5" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300/40 bg-slate-300/10 text-slate-300">
          <Medal className="h-5 w-5" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-700/40 bg-amber-700/10 text-amber-600">
          <Award className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#282828] bg-[#121212] font-semibold text-[#888888]">
        #{rank}
      </div>
    );
  };

  const renderProject = (project: LeaderboardProject, isMyProject = false) => {
    const isExpanded = expandedProjects[project.project_id];
    const hasCriterionScores =
      project.criterion_scores && project.criterion_scores.length > 0;

    return (
      <Card
        key={project.project_id}
        className={`transition-colors ${
          isMyProject
            ? "border-blue-500/40 bg-blue-950/10 text-[#E0E0E0]"
            : "border-[#282828] bg-[#181818] text-[#E0E0E0]"
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Project & Team Details */}
            <div className="flex items-center gap-3.5 min-w-60">
              {renderRankBadge(project.rank)}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#EDEDED]">
                    {project.project_title}
                  </h3>
                  {isMyProject && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                      Your Project
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#888888]">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#888888]" />
                    {project.team?.name || "Unknown Team"}
                  </span>

                  {project.track && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[#888888]">
                        <Tag className="h-3 w-3" />
                        {project.track.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Score & Expansion Controls */}
            <div className="flex items-center gap-4 ml-auto sm:ml-0">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-extrabold text-[#EDEDED]">
                    {(project.final_score ?? 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-[#888888]">
                  {project.review_count}{" "}
                  {project.review_count === 1 ? "review" : "reviews"}
                </p>
              </div>

              {hasCriterionScores && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(project.project_id)}
                  className="h-8 w-8 p-0 text-[#888888] hover:bg-[#282828] hover:text-[#EDEDED]"
                  title="Toggle Criteria Details"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Breakdown by Criterion */}
          {hasCriterionScores && isExpanded && (
            <div className="mt-4 border-t border-[#282828] pt-3">
              <p className="mb-2.5 text-[11px] font-semibold text-[#888888]">
                Criterion Breakdown Average
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {project.criterion_scores.map((cs) => (
                  <div
                    key={cs.criterion_id}
                    className="flex items-center justify-between rounded-md border border-[#282828] bg-[#121212] p-2.5 text-xs"
                  >
                    <span className="truncate text-[#888888]" title={cs.name}>
                      {cs.name}
                    </span>
                    <span className="ml-2 font-bold text-[#EDEDED]">
                      {(cs.average ?? 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#888888]" />
          <p className="text-xs text-[#888888]">Loading leaderboard rankings...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-center text-[#E0E0E0]">
          <CardContent className="space-y-4 p-8">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#EDEDED]">Leaderboard Unavailable</h2>
              <p className="text-xs text-[#888888]">
                Leaderboard details could not be loaded for this hackathon.
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

  const myRank = record.my_rank;
  const leaderboard = record.leaderboard || [];

  return (
    <main className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-5xl space-y-6">
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
            Back
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#888888]" />
                <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                  Hackathon Leaderboard
                </h1>
              </div>
              <p className="mt-1 text-xs text-[#888888]">
                Project rankings dynamically calculated based on submitted judge evaluations.
              </p>
            </div>
          </div>
        </header>

        {/* Participant's Own Rank */}
        {myRank && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#888888]">
              Your Ranking
            </h2>
            {renderProject(myRank, true)}
          </section>
        )}

        {/* Leaderboard List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#282828] pb-3">
            <h2 className="text-base font-semibold text-[#EDEDED]">
              Overall Rankings
            </h2>
            <span className="text-xs text-[#888888]">
              {leaderboard.length} project{leaderboard.length === 1 ? "" : "s"} listed
            </span>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((project) => renderProject(project))}
            </div>
          ) : (
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto h-8 w-8 text-[#282828]" />
                <p className="mt-2 text-xs text-[#888888]">
                  No projects have received finalized reviews on the leaderboard yet.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {!myRank && (
          <div className="rounded-lg border border-[#282828] bg-[#181818] p-4 text-center text-xs text-[#888888]">
            Your project does not currently have a published rank or score.
          </div>
        )}
      </div>
    </main>
  );
};

export default Page;