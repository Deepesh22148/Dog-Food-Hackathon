"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import hackathonService from "../../hackathonService";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Layers,
  Users,
  Copy,
  Check,
  FolderPlus,
  Edit,
  UserCheck,
  Tag,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

interface HackathonDetail {
  hackathon: {
    id: string;
    title: string;
    description: string | null;
    phase: string;
    registration_start: string;
    registration_end: string;
    submission_deadline: string;
    judging_start: string;
    judging_end: string;
    tracks: { id: string; name: string }[];
    _count: { participants: number; teams: number };
  };
  registration_open: boolean;
  submission_open: boolean;
  viewer_role: "ORGANIZER" | "JUDGE" | "PARTICIPANT" | null;
  judge_status: "PENDING" | "ACCEPTED" | "REJECTED" | null;
  participation: { id: string; is_team_leader: boolean } | null;
  team: {
    id: string;
    name: string;
    invite_token: string;
    participants: {
      id: string;
      is_team_leader: boolean;
      user: { id: string; name: string };
    }[];
    pending_requests: {
      id: string;
      created_at: string;
      user: { id: string; name: string };
    }[];
  } | null;
  project: {
    id: string;
    title: string;
    status: "DRAFT" | "SUBMITTED";
    submitted_at: string | null;
  } | null;
  pending_join_request: {
    id: string;
    team: { id: string; name: string };
  } | null;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const Badge = ({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "green" | "red";
}) => {
  const tones = {
    gray: "border-[#282828] text-[#A0A0A0] bg-[#121212]",
    green: "border-emerald-800/60 text-emerald-400 bg-emerald-950/20",
    red: "border-red-900/60 text-red-400 bg-red-950/20",
  };
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [joining, setJoining] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [detail, setDetail] = useState<HackathonDetail | null>(null);

  const getHackathonDetails = useCallback(async () => {
    try {
      const response = await hackathonService.getHackathonDetail(hackathon_id);
      if (response.success) {
        setDetail(response.data);
      } else {
        toast.add({
          title: response.error?.code ?? "Failed to fetch hackathon",
        });
      }
    } catch (error) {
      console.error(
        "Something went wrong while fetching hackathon details",
        error,
      );
      toast.add({ title: "Internal server error" });
    }
  }, [hackathon_id]);

  const handleParticipate = async () => {
    try {
      setJoining(true);
      const response =
        await hackathonService.participateHackathon(hackathon_id);
      if (response.success) {
        toast.add({ title: "You are now participating!" });
        setRefreshKey((k) => !k);
      } else if (response.error?.code === "UNAUTHORIZED") {
        router.push("/login");
      } else {
        toast.add({
          title: response.error?.code ?? "Failed to participate",
          description: response.error?.message,
        });
      }
    } catch (error) {
      console.error("Error while participating", error);
      toast.add({ title: "Internal server error" });
    } finally {
      setJoining(false);
    }
  };

  const copyInviteToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.add({ title: "Invite token copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await getHackathonDetails();
      setLoading(false);
    };
    load();
  }, [refreshKey, getHackathonDetails]);

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

  if (!detail) {
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

  const {
    hackathon,
    registration_open,
    submission_open,
    viewer_role,
    judge_status,
    participation,
    team,
    project,
    pending_join_request,
  } = detail;

  const renderParticipation = () => {
    if (viewer_role === "ORGANIZER") {
      return (
        <p className="text-xs text-[#888888]">
          You are managing this hackathon as an <span className="text-[#EDEDED]">Organizer</span>.
        </p>
      );
    }

    if (viewer_role === "JUDGE") {
      return (
        <p className="text-xs text-[#888888]">
          You are a judge for this hackathon (invitation:{" "}
          <span className="font-medium text-[#EDEDED]">{judge_status}</span>).
        </p>
      );
    }

    if (!participation) {
      return registration_open ? (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-[#888888]">
            Registration is open. Join now to form or participate in a team.
          </p>
          <Button
            onClick={handleParticipate}
            disabled={joining}
            className="bg-[#EDEDED] text-xs font-medium text-[#121212] transition-colors hover:bg-[#FFFFFF]"
          >
            {joining ? "Joining..." : "Participate Now"}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-[#888888]">
          Registration is currently closed for this hackathon.
        </p>
      );
    }

    if (!team) {
      return (
        <div className="space-y-2 text-xs text-[#888888]">
          <p>You are registered as an individual participant.</p>
          {pending_join_request && (
            <p className="rounded-md border border-[#282828] bg-[#121212] p-2.5 text-[#888888]">
              Pending request to join team:{" "}
              <span className="font-medium text-[#EDEDED]">
                {pending_join_request.team.name}
              </span>
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Team Details */}
        <div className="rounded-lg border border-[#282828] bg-[#121212] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#EDEDED]">
                {team.name}
              </h3>
              {participation.is_team_leader && <Badge tone="green">Team Leader</Badge>}
            </div>
            <span className="text-[11px] text-[#888888]">
              {team.participants.length} Member{team.participants.length > 1 ? "s" : ""}
            </span>
          </div>

          <ul className="mt-3 divide-y divide-[#282828]/50 text-xs text-[#888888]">
            {team.participants.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-1.5">
                <span className="text-[#EDEDED]">{member.user.name}</span>
                {member.is_team_leader && (
                  <span className="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#A0A0A0]">
                    Leader
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Invite Token */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-[#888888]">
            Team Invite Token
          </label>
          <div className="flex items-center gap-2">
            <code className="block flex-1 rounded-md border border-[#282828] bg-[#121212] px-3 py-1.5 font-mono text-xs text-[#EDEDED]">
              {team.invite_token}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyInviteToken(team.invite_token)}
              className="border-[#282828] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
            >
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {participation.is_team_leader && (
          <p className="text-xs text-[#888888]">
            Pending join requests:{" "}
            <span className="font-semibold text-[#EDEDED]">
              {team.pending_requests.length}
            </span>
          </p>
        )}

        {/* Project Section */}
        {submission_open && (
          <div className="border-t border-[#282828] pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#EDEDED]">
                Team Project
              </h4>
            </div>

            {project ? (
              <div className="rounded-lg border border-[#282828] bg-[#121212] p-4 text-xs text-[#888888]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[#EDEDED]">
                    {project.title}
                  </span>
                  <Badge tone={project.status === "SUBMITTED" ? "green" : "gray"}>
                    {project.status}
                  </Badge>
                </div>

                {project.submitted_at && (
                  <p className="mt-2 text-[#888888]">
                    Submitted: {formatDate(project.submitted_at)}
                  </p>
                )}

                {project.status === "DRAFT" && participation?.is_team_leader && (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/hackathon/${hackathon_id}/team/${team.id}/project/${project.id}/edit`,
                      )
                    }
                    className="mt-3 bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit Project
                  </Button>
                )}
              </div>
            ) : participation?.is_team_leader ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[#282828] bg-[#121212] p-4">
                <p className="text-xs text-[#888888]">No project draft found.</p>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/hackathon/${hackathon_id}/team/${team.id}/project/create`,
                    )
                  }
                  className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
                >
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                  Create Project
                </Button>
              </div>
            ) : (
              <p className="text-xs text-[#888888]">
                Your team leader has not created a project draft yet.
              </p>
            )}
          </div>
        )}
      </div>
    );
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

            <Button
              onClick={() =>
                router.push(`/hackathon/${hackathon_id}/leaderboard`)
              }
              className="bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
            >
              <Trophy className="mr-1.5 h-4 w-4" />
              Leaderboard
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                {hackathon.title}
              </h1>
              <Badge>{hackathon.phase}</Badge>
              <Badge tone={registration_open ? "green" : "red"}>
                {registration_open ? "Registration Open" : "Registration Closed"}
              </Badge>
              <Badge tone={submission_open ? "green" : "red"}>
                {submission_open ? "Submissions Open" : "Submissions Closed"}
              </Badge>
            </div>

            {hackathon.description && (
              <p className="max-w-3xl whitespace-pre-wrap text-xs text-[#888888]">
                {hackathon.description}
              </p>
            )}
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Area: Participation & Team Status */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0] shadow-sm">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-base font-semibold text-[#EDEDED]">
                    Your Status & Participation
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">{renderParticipation()}</CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Schedule, Tracks, Quick Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-[#282828] bg-[#181818] p-3.5 text-[#E0E0E0]">
                <div className="flex items-center gap-2 text-xs text-[#888888]">
                  <Users className="h-3.5 w-3.5" />
                  <span>Participants</span>
                </div>
                <p className="mt-1 text-xl font-bold text-[#EDEDED]">
                  {hackathon._count.participants}
                </p>
              </Card>

              <Card className="border-[#282828] bg-[#181818] p-3.5 text-[#E0E0E0]">
                <div className="flex items-center gap-2 text-xs text-[#888888]">
                  <Users className="h-3.5 w-3.5" />
                  <span>Teams</span>
                </div>
                <p className="mt-1 text-xl font-bold text-[#EDEDED]">
                  {hackathon._count.teams}
                </p>
              </Card>
            </div>

            {/* Event Schedule Card */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Timeline
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs text-[#888888]">
                <div>
                  <span className="block font-medium text-[#EDEDED]">
                    Registration Period
                  </span>
                  <span className="text-[11px]">
                    {formatDate(hackathon.registration_start)} —{" "}
                    {formatDate(hackathon.registration_end)}
                  </span>
                </div>
                <div className="border-t border-[#282828] pt-2">
                  <span className="block font-medium text-[#EDEDED]">
                    Submission Deadline
                  </span>
                  <span className="text-[11px]">
                    {formatDate(hackathon.submission_deadline)}
                  </span>
                </div>
                <div className="border-t border-[#282828] pt-2">
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

            {/* Tracks Card */}
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Tracks
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {hackathon.tracks.length === 0 ? (
                  <p className="text-xs text-[#888888]">No tracks specified.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hackathon.tracks.map((track) => (
                      <span
                        key={track.id}
                        className="inline-flex items-center gap-1 rounded-md border border-[#282828] bg-[#121212] px-2.5 py-1 text-xs text-[#B0B0B0]"
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
        </div>
      </div>
    </div>
  );
};

export default Page;