"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import hackathonService from "@/app/hackathon/hackathonService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Copy,
  Users,
  UserCheck,
  Clock,
  Check,
  X,
  ShieldCheck,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string; team_id: string }>;
}

type TeamMember = {
  id: string;
  user_id: string;
  is_team_leader: boolean;
  user: {
    id: string;
    name: string;
  };
};

type PendingRequest = {
  id: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
};

type TeamDetails = {
  id: string;
  name: string;
  invite_token: string | null;
  created_at: string;
  updated_at: string;
  participants: TeamMember[];
  pendingRequests: PendingRequest[];
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id, team_id } = use(params);

  const [team, setTeam] = React.useState<TeamDetails | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const router = useRouter();

  const getTeamDetails = async () => {
    try {
      setLoading(true);

      const response = await hackathonService.viewTeam(hackathon_id, team_id);

      if (response.success && response.data?.data) {
        setTeam(response.data.data);
        return;
      }

      toast.add({
        title: "Failed to load team",
        description:
          response.error?.message ??
          "Something went wrong while loading team details.",
      });
    } catch (error) {
      console.error("Error while loading team details:", error);

      toast.add({
        title: "Error",
        description: "Unable to load team details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!team?.invite_token) return;

    try {
      const inviteLink = `${window.location.origin}/hackathon/${hackathon_id}/team/join?token=${team.invite_token}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.add({
        title: "Invite link copied",
        description: "Share this link with your teammates.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
      toast.add({
        title: "Copy failed",
        description: "Unable to copy the invite link.",
      });
    }
  };

  const handleAccept = async (participant_id: string) => {
    try {
      setProcessingId(participant_id);
      const response = await hackathonService.acceptMember(
        hackathon_id,
        team_id,
        participant_id
      );
      if (!response.success) {
        toast.add({
          title: "Failed to accept request",
          description:
            response.error?.message ??
            "Unable to accept the team join request.",
        });
        return;
      }
      toast.add({
        title: "Participant accepted",
        description: "The participant has been added to your team.",
      });
      setRefreshKey((prev) => !prev);
    } catch (error) {
      console.error("handleAccept ::: Error:", error);
      toast.add({
        title: "Error",
        description: "Unable to accept the team join request.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (participant_id: string) => {
    try {
      setProcessingId(participant_id);
      const response = await hackathonService.rejectMember(
        hackathon_id,
        team_id,
        participant_id
      );
      if (!response.success) {
        toast.add({
          title: "Failed to reject request",
          description:
            response.error?.message ??
            "Unable to reject the team join request.",
        });
        return;
      }
      toast.add({
        title: "Request rejected",
        description: "The team join request has been rejected.",
      });
      setRefreshKey((prev) => !prev);
    } catch (error) {
      console.error("handleReject ::: Error:", error);
      toast.add({
        title: "Error",
        description: "Unable to reject the team join request.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  React.useEffect(() => {
    getTeamDetails();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team details...
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#121212] p-6 text-[#E0E0E0] antialiased">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border border-[#282828] bg-[#181818] p-8 text-center">
          <Users className="mb-3 h-8 w-8 text-[#555555]" />
          <h1 className="text-base font-semibold text-[#EDEDED]">
            Team not found
          </h1>
          <p className="mt-1 text-xs text-[#888888]">
            This team may have been deleted or you do not have permission to view it.
          </p>

          <Button
            className="mt-5 bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
            onClick={() => router.push(`/hackathon/${hackathon_id}/team`)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-[#282828] pb-5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push(`/hackathon/${hackathon_id}/team`)}
            className="border-[#2A2A2A] bg-[#181818] text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
            aria-label="Back to teams"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
              {team.name}
            </h1>
            <p className="mt-0.5 text-xs text-[#888888]">
              Manage members, invitations, and join requests.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Invite Section */}
          {team.invite_token && (
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Team Invite Link
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-md border border-[#2A2A2A] bg-[#121212] p-3.5">
                  <div>
                    <p className="text-xs font-medium text-[#EDEDED]">
                      Invite teammates via link
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#888888]">
                      Anyone with this link can send a request to join your team.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInviteLink}
                    className="shrink-0 border-[#2A2A2A] bg-[#181818] text-xs font-medium text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Card */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#888888]" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Members ({team.participants.length})
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-2">
                {team.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-md border border-[#2A2A2A] bg-[#121212] px-3.5 py-2.5"
                  >
                    <span className="text-xs font-medium text-[#EDEDED]">
                      {participant.user.name}
                    </span>

                    {participant.is_team_leader ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/80 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Team Leader
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#888888]">
                        <UserCheck className="h-3 w-3" />
                        Member
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests Card */}
          {team.pendingRequests.length > 0 && (
            <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
              <CardHeader className="border-b border-[#282828] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                    Pending Join Requests ({team.pendingRequests.length})
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-2.5">
                  {team.pendingRequests.map((request) => {
                    const isProcessing = processingId === request.user.id;

                    return (
                      <div
                        key={request.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-md border border-[#2A2A2A] bg-[#121212] px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-medium text-[#EDEDED]">
                            {request.user.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#888888]">
                            Requested to join
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleAccept(request.user.id)}
                            className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
                          >
                            <Check className="mr-1 h-3.5 w-3.5 text-emerald-700" />
                            Accept
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => handleReject(request.user.id)}
                            className="border-[#2A2A2A] bg-[#181818] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
                          >
                            <X className="mr-1 h-3.5 w-3.5 text-red-400" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;