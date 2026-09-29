"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import organizerService from "../../organizerService";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Users,
  Gavel,
  Trophy,
  Tag,
  Activity,
  SlidersHorizontal,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

interface Track {
  id: string;
  name: string;
}

interface HackathonDetails {
  id: string;
  title: string;
  description: string | null;
  phase: string;

  registration_start: string;
  registration_end: string;
  submission_deadline: string;
  judging_start: string;
  judging_end: string;

  created_at: string;
  updated_at: string;

  tracks: Track[];

  _count: {
    participants: number;
    teams: number;
    judges: number;
    tracks: number;
  };
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="whitespace-nowrap rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-[11px] font-medium text-[#A0A0A0]">
      {children}
    </span>
  );
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [hackathon, setHackathon] = useState<HackathonDetails | null>(null);

  const getHackathonDetails = useCallback(async () => {
    try {
      const response = await organizerService.getHackathonDetails(hackathon_id);

      if (!response.success) {
        toast.add({
          title: "Failed to fetch hackathon",
          description: "Unable to fetch hackathon details",
        });
        return;
      }

      setHackathon(response.data);
    } catch (error) {
      console.error("Error while fetching hackathon details:", error);

      toast.add({
        title: "INTERNAL SERVER ERROR",
        description: "Something went wrong while fetching hackathon details",
      });
    }
  }, [hackathon_id]);

  const loadEssentials = useCallback(async () => {
    setLoading(true);
    await getHackathonDetails();
    setLoading(false);
  }, [getHackathonDetails]);

  useEffect(() => {
    loadEssentials();
  }, [refreshKey, loadEssentials]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#888888] border-t-transparent" />
          <p className="text-xs text-[#888888]">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#121212] p-6 text-[#E0E0E0]">
        <p className="text-xs text-[#888888]">Hackathon not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] hover:bg-[#282828]"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const handleManageJudge = () => {
    router.push(`/organizer/${hackathon_id}/judge`);
  };

  const handleViewLeaderboard = () => {
    router.push(`/hackathon/${hackathon_id}/leaderboard`);
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Header */}
        <header className="flex flex-col gap-4 border-b border-[#282828] pb-5">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-[#282828] bg-[#181818] text-xs text-[#E0E0E0] transition-colors hover:bg-[#282828] hover:text-[#FFFFFF]"
              aria-label="Go back"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLeaderboard}
                className="border-[#282828] bg-[#181818] text-xs text-[#E0E0E0] transition-colors hover:bg-[#282828] hover:text-[#FFFFFF]"
              >
                <Trophy className="mr-1.5 h-4 w-4" />
                Leaderboard
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                {hackathon.title}
              </h1>
              <Badge>Phase: {hackathon.phase}</Badge>
            </div>

            {hackathon.description && (
              <p className="max-w-3xl whitespace-pre-wrap text-xs text-[#888888]">
                {hackathon.description}
              </p>
            )}
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Area: Overview Stats & Actions */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Actions Card */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-base font-semibold text-[#EDEDED]">
                    Organizer Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleManageJudge}
                    className="bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
                  >
                    <Gavel className="mr-1.5 h-4 w-4" />
                    Manage Judges
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hackathon Overview / Metrics */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-base font-semibold text-[#EDEDED]">
                    Overview & Metrics
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-[#282828] bg-[#121212] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                      <Users className="h-3.5 w-3.5" />
                      <span>Participants</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
                      {hackathon._count.participants}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#282828] bg-[#121212] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                      <Users className="h-3.5 w-3.5" />
                      <span>Teams</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
                      {hackathon._count.teams}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#282828] bg-[#121212] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                      <Gavel className="h-3.5 w-3.5" />
                      <span>Judges</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
                      {hackathon._count.judges}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#282828] bg-[#121212] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Tracks</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
                      {hackathon._count.tracks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracks Card */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-base font-semibold text-[#EDEDED]">
                    Event Tracks
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {hackathon.tracks.length === 0 ? (
                  <p className="text-xs text-[#888888]">No tracks created yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hackathon.tracks.map((track) => (
                      <span
                        key={track.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#121212] px-3 py-1.5 text-xs text-[#EDEDED]"
                      >
                        <Tag className="h-3 w-3 text-[#888888]" />
                        {track.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Hackathon Schedule */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Schedule Timeline
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-4 text-xs text-[#888888]">
                <div>
                  <span className="block font-medium text-[#EDEDED]">
                    Registration Window
                  </span>
                  <span className="text-[11px]">
                    {formatDate(hackathon.registration_start)} —{" "}
                    {formatDate(hackathon.registration_end)}
                  </span>
                </div>

                <div className="border-t border-[#282828] pt-2.5">
                  <span className="block font-medium text-[#EDEDED]">
                    Submission Deadline
                  </span>
                  <span className="text-[11px]">
                    {formatDate(hackathon.submission_deadline)}
                  </span>
                </div>

                <div className="border-t border-[#282828] pt-2.5">
                  <span className="block font-medium text-[#EDEDED]">
                    Judging Window
                  </span>
                  <span className="text-[11px]">
                    {formatDate(hackathon.judging_start)} —{" "}
                    {formatDate(hackathon.judging_end)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;