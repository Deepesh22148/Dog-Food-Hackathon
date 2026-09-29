"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import organizerService from "../../organizerService";
import {
  ArrowLeft,
  Gavel,
  Mail,
  User,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

interface JudgeUser {
  id: string;
  name: string;
  email: string;
  judgeStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

interface Track {
  id: string;
  name: string;
}

const StatusBadge = ({ status }: { status: JudgeUser["judgeStatus"] }) => {
  switch (status) {
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Accepted
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/60 bg-amber-950/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-900/60 bg-red-950/20 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#282828] bg-[#121212] px-2.5 py-0.5 text-[11px] font-medium text-[#888888]">
          Available
        </span>
      );
  }
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [judgeList, setJudgeList] = useState<JudgeUser[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const [selectedJudge, setSelectedJudge] = useState<JudgeUser | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);

  const getJudgeDataList = useCallback(async () => {
    try {
      const response = await organizerService.getJudgeList(hackathon_id);

      if (!response.success) {
        toast.add({
          title: "Failed to fetch judge list",
          description: "Unable to fetch judge list",
        });
        return;
      }

      setJudgeList(response.data);
    } catch (error) {
      console.error("Something went wrong while fetching judge list:", error);

      toast.add({
        title: "Internal Server Error",
        description: "Something went wrong while fetching judge list",
      });
    }
  }, [hackathon_id]);

  const getTrackList = useCallback(async () => {
    try {
      const response = await organizerService.getHackathonDetails(hackathon_id);

      if (!response.success) {
        toast.add({
          title: "Failed to fetch tracks",
          description: "Unable to fetch hackathon tracks",
        });
        return;
      }

      setTracks(response.data?.tracks || []);
    } catch (error) {
      console.error("Something went wrong while fetching tracks:", error);

      toast.add({
        title: "Internal Server Error",
        description: "Unable to fetch hackathon tracks",
      });
    }
  }, [hackathon_id]);

  const loadEssentials = useCallback(async () => {
    setLoading(true);
    await Promise.all([getJudgeDataList(), getTrackList()]);
    setLoading(false);
  }, [getJudgeDataList, getTrackList]);

  useEffect(() => {
    loadEssentials();
  }, [refreshKey, loadEssentials]);

  const openInviteDialog = (judge: JudgeUser) => {
    setSelectedJudge(judge);
    setSelectedTracks([]);
    setInviteOpen(true);
  };

  const toggleTrack = (trackId: string) => {
    setSelectedTracks((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId],
    );
  };

  const handleInviteJudge = async () => {
    if (!selectedJudge) {
      return;
    }

    if (selectedTracks.length === 0) {
      toast.add({
        title: "Select at least one track",
        description: "A judge must be assigned to at least one track",
      });
      return;
    }

    try {
      setInviteLoading(true);

      const response = await organizerService.inviteJudge(
        selectedJudge.id,
        hackathon_id,
        selectedTracks,
      );

      if (!response.success) {
        toast.add({
          title: "Invitation failed",
          description: "Unable to invite judge",
        });
        return;
      }

      toast.add({
        title: "Invitation sent",
        description: `${selectedJudge.name} has been invited as a judge`,
      });

      setInviteOpen(false);
      setSelectedJudge(null);
      setSelectedTracks([]);

      setRefreshKey((previous) => !previous);
    } catch (error) {
      console.error("Something went wrong while inviting judge:", error);

      toast.add({
        title: "Internal Server Error",
        description: "Something went wrong while inviting judge",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#888888] border-t-transparent" />
          <p className="text-xs text-[#888888]">Loading judge list...</p>
        </div>
      </div>
    );
  }

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
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                Manage Judges
              </h1>
              <p className="mt-1 text-xs text-[#888888]">
                Invite judges and assign tracks to evaluate project submissions.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
          <CardHeader className="border-b border-[#282828] pb-3">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-[#888888]" />
              <CardTitle className="text-base font-semibold text-[#EDEDED]">
                Judge Candidates ({judgeList.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {judgeList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888888]">
                No users available to invite as judges.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#282828] bg-[#121212] text-[#888888]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282828]">
                    {judgeList.map((judge) => (
                      <tr
                        key={judge.id}
                        className="transition-colors hover:bg-[#121212]/50"
                      >
                        <td className="px-5 py-3.5 font-medium text-[#EDEDED]">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-[#888888]" />
                            {judge.name}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-[#888888]">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-[#888888]" />
                            {judge.email}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <StatusBadge status={judge.judgeStatus} />
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {judge.judgeStatus === null && (
                            <Button
                              size="sm"
                              onClick={() => openInviteDialog(judge)}
                              className="bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              Invite
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="border-[#282828] bg-[#181818] text-[#E0E0E0] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-[#EDEDED]">
                Invite Judge
              </DialogTitle>
              <DialogDescription className="text-xs text-[#888888]">
                Assign tracks for this judge to evaluate before sending the invitation.
              </DialogDescription>
            </DialogHeader>

            {selectedJudge && (
              <div className="space-y-4 py-2">
                {/* Judge Info Card */}
                <div className="rounded-lg border border-[#282828] bg-[#121212] p-3.5">
                  <p className="text-xs font-medium text-[#EDEDED]">
                    {selectedJudge.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#888888]">
                    {selectedJudge.email}
                  </p>
                </div>

                {/* Track Selection */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[#EDEDED]">
                    <Layers className="h-3.5 w-3.5 text-[#888888]" />
                    Assign Evaluation Tracks
                  </label>

                  {tracks.length === 0 ? (
                    <p className="rounded-lg border border-[#282828] bg-[#121212] p-3 text-xs text-[#888888]">
                      No tracks found for this hackathon. Please create tracks first.
                    </p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {tracks.map((track) => {
                        const isChecked = selectedTracks.includes(track.id);
                        return (
                          <label
                            key={track.id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                              isChecked
                                ? "border-[#EDEDED]/40 bg-[#282828]/50 text-[#EDEDED]"
                                : "border-[#282828] bg-[#121212] text-[#888888] hover:border-[#383838]"
                            }`}
                          >
                            <span className="text-xs font-medium">
                              {track.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTrack(track.id)}
                              className="h-4 w-4 rounded border-[#282828] bg-[#121212] text-[#EDEDED] accent-[#EDEDED] focus:ring-0"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
                disabled={inviteLoading}
                className="border-[#282828] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828]"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleInviteJudge}
                disabled={inviteLoading || selectedTracks.length === 0}
                className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;