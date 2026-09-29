"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import pariticipantService from "../pariticipantService";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  ArrowLeft,
  Gavel,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Check,
  X,
  Loader2,
  Tag,
} from "lucide-react";

interface Track {
  id: string;
  name: string;
}

interface JudgeHackathon {
  id: string;
  hackathon: {
    id: string;
    title: string;
    description: string | null;
    phase: string;
    registration_end: string;
    submission_deadline: string;
    judging_start: string;
    judging_end: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  tracks: Track[];
  created_at: string;
  responded_at: string | null;
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

const StatusBadge = ({ status }: { status: JudgeHackathon["status"] }) => {
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
          Pending Response
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-900/60 bg-red-950/20 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
          <XCircle className="h-3 w-3" />
          Declined
        </span>
      );
  }
};

const Page = () => {
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [hackathons, setHackathons] = useState<JudgeHackathon[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const getJudgeHackathons = useCallback(async () => {
    try {
      const response = await pariticipantService.getJudgeList();
      if (response.success) {
        setHackathons(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.add({
          title: response.error?.code ?? "Failed to fetch judge hackathons",
        });
      }
    } catch (error) {
      console.error(
        "Something went wrong while getting judge hackathons ::: ",
        error,
      );
      toast.add({ title: "Internal server error" });
    }
  }, []);

  const handleInvitation = async (hackathon_id: string, accept: boolean) => {
    try {
      setRespondingId(hackathon_id);
      const response = await pariticipantService.respondToJudgeInvite(
        hackathon_id,
        accept,
      );

      if (response.success) {
        toast.add({
          title: accept ? "Invitation accepted" : "Invitation rejected",
        });
        setRefreshKey((k) => !k);
      } else {
        toast.add({
          title:
            typeof response.error === "string"
              ? response.error
              : response.error?.message || "Failed to respond to invitation",
        });
      }
    } catch (error) {
      console.error("Error while responding to invitation ::: ", error);
      toast.add({ title: "Internal server error" });
    } finally {
      setRespondingId(null);
    }
  };

  const loadEssentials = useCallback(async () => {
    setLoading(true);
    await getJudgeHackathons();
    setLoading(false);
  }, [getJudgeHackathons]);

  useEffect(() => {
    loadEssentials();
  }, [refreshKey, loadEssentials]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#888888] border-t-transparent" />
          <p className="text-xs text-[#888888]">Loading judge invitations...</p>
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

          <div>
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-[#888888]" />
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
                My Judge Hackathons
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#888888]">
              Hackathons where you have been invited or assigned to evaluate project submissions.
            </p>
          </div>
        </header>

        {/* Content Section */}
        {hackathons.length === 0 ? (
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Gavel className="h-10 w-10 text-[#282828]" />
              <p className="mt-3 text-xs text-[#888888]">
                You have not been assigned to any hackathons as a judge yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {hackathons.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col justify-between border-[#282828] bg-[#181818] text-[#E0E0E0]"
              >
                <div>
                  <CardHeader className="border-b border-[#282828] pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-[#EDEDED]">
                          {item.hackathon.title}
                        </CardTitle>
                        <span className="inline-block rounded-full border border-[#282828] bg-[#121212] px-2 py-0.5 text-[10px] text-[#888888]">
                          Phase: {item.hackathon.phase}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    {item.hackathon.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-[#888888]">
                        {item.hackathon.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Assigned Tracks */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#EDEDED]">
                        <Layers className="h-3.5 w-3.5 text-[#888888]" />
                        <span>Assigned Tracks</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tracks.length === 0 ? (
                          <span className="text-[11px] text-[#888888]">
                            No tracks assigned yet
                          </span>
                        ) : (
                          item.tracks.map((track) => (
                            <span
                              key={track.id}
                              className="inline-flex items-center gap-1 rounded border border-[#282828] bg-[#121212] px-2.5 py-1 text-[11px] text-[#EDEDED]"
                            >
                              <Tag className="h-3 w-3 text-[#888888]" />
                              {track.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-lg border border-[#282828] bg-[#121212] p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[#888888]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Submission Deadline
                        </span>
                        <span className="font-medium text-[#EDEDED]">
                          {formatDate(item.hackathon.submission_deadline)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#282828] pt-2 text-[#888888]">
                        <span>Judging Window</span>
                        <span className="font-medium text-[#EDEDED]">
                          {formatDate(item.hackathon.judging_start)} — {formatDate(item.hackathon.judging_end)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Actions */}
                <CardFooter className="border-t border-[#282828] pt-4">
                  {item.status === "PENDING" && (
                    <div className="flex w-full items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInvitation(item.hackathon.id, true)}
                        disabled={respondingId === item.hackathon.id}
                        className="flex-1 bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
                      >
                        {respondingId === item.hackathon.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvitation(item.hackathon.id, false)}
                        disabled={respondingId === item.hackathon.id}
                        className="flex-1 border-[#282828] bg-[#121212] text-xs text-[#E0E0E0] transition-colors hover:bg-[#282828] hover:text-[#FFFFFF]"
                      >
                        {respondingId === item.hackathon.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Decline
                      </Button>
                    </div>
                  )}

                  {item.status === "ACCEPTED" && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/judge/hackathons/${item.hackathon.id}`)}
                      className="w-full bg-[#EDEDED] text-xs font-semibold text-[#121212] transition-colors hover:bg-[#FFFFFF]"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Enter Hackathon
                    </Button>
                  )}

                  {item.status === "REJECTED" && (
                    <span className="text-xs text-[#888888]">
                      Invitation declined
                    </span>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;