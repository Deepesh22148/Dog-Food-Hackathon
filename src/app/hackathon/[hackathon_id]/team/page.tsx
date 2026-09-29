"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import hackathonService from "../../hackathonService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  UserCheck,
  UserPlus,
  Eye,
} from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

type TeamMember = {
  id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
  };
};

type Team = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  participants: TeamMember[];
};

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);

  const getTeamMemberList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hackathonService.getTeamList(hackathon_id);

      if (response.success) {
        setTeams(response.data?.teams ?? []);
        setCurrentTeamId(response.data?.currentTeamId ?? null);
      } else {
        toast.add({
          title: "Failed to load teams",
          description:
            response.error?.message ??
            "Something went wrong while loading teams",
        });
      }
    } catch (error) {
      console.error("Error while loading team member list:", error);
      toast.add({
        title: "Error loading team list",
      });
    } finally {
      setLoading(false);
    }
  }, [hackathon_id]);

  const requestJoin = async (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    try {
      setJoiningTeamId(teamId);
      const response = await hackathonService.joinTeam(hackathon_id, teamId);
      if (response.success) {
        toast.add({
          title: "Join request sent",
          description: "Your request has been sent to the team leader.",
        });
        setRefreshKey((prev) => !prev);
        return;
      }
      toast.add({
        title: "Unable to join team",
        description:
          response.error?.message ?? "Failed to send team join request.",
      });
    } catch (error) {
      console.error("Error while requesting to join team:", error);
      toast.add({
        title: "Error",
        description: "Something went wrong while sending the join request.",
      });
    } finally {
      setJoiningTeamId(null);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTeam = () => {
    router.push(`/hackathon/${hackathon_id}/team/create`);
  };

  useEffect(() => {
    getTeamMemberList();
  }, [refreshKey, getTeamMemberList]);

  return (
    <div className="min-h-screen w-full bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-[#282828] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-[#2A2A2A] bg-[#181818] text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
                Team Formation
              </h1>
              <p className="mt-0.5 text-xs text-[#888888]">
                Join an existing team or view your team status.
              </p>
            </div>
          </div>

          <div>
            {currentTeamId ? (
              <Button
                onClick={() =>
                  router.push(
                    `/hackathon/${hackathon_id}/team/${currentTeamId}/view`
                  )
                }
                className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Current Team
              </Button>
            ) : (
              <Button
                onClick={handleCreateTeam}
                className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create New Team
              </Button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <Input
            placeholder="Search teams by name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-[#282828] bg-[#181818] pl-9 text-xs text-[#EDEDED] placeholder:text-[#666666] focus:border-[#444444]"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-62.5 items-center justify-center rounded-lg border border-[#282828] bg-[#181818]">
            <p className="animate-pulse text-xs text-[#888888]">
              Loading teams...
            </p>
          </div>
        ) : filteredTeams.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-62.5 flex-col items-center justify-center rounded-lg border border-[#282828] bg-[#181818] p-8 text-center">
            <Users className="mb-3 h-8 w-8 text-[#555555]" />
            <h2 className="text-sm font-semibold text-[#EDEDED]">
              No teams found
            </h2>
            <p className="mt-1 text-xs text-[#888888]">
              {teams.length === 0
                ? "No teams have been created for this hackathon yet."
                : "No teams match your search query."}
            </p>
          </div>
        ) : (
          /* Teams List Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => {
              const isCurrentTeam = team.id === currentTeamId;

              return (
                <Card
                  key={team.id}
                  onClick={() =>
                    router.push(
                      `/hackathon/${hackathon_id}/team/${team.id}/view`
                    )
                  }
                  className={`cursor-pointer transition-all hover:border-[#383838] ${
                    isCurrentTeam
                      ? "border-emerald-800/80 bg-[#181818]"
                      : "border-[#282828] bg-[#181818]"
                  }`}
                >
                  <CardHeader className="border-b border-[#282828] pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-[#EDEDED]">
                        {team.name}
                      </CardTitle>

                      {isCurrentTeam && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <UserCheck className="h-3 w-3" />
                          Your Team
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <p className="mb-2 text-[11px] text-[#888888]">
                        Members ({team.participants.length})
                      </p>

                      <div className="space-y-1.5">
                        {team.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="rounded-md border border-[#2A2A2A] bg-[#121212] px-2.5 py-1.5 text-xs text-[#D0D0D0]"
                          >
                            {participant.user.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isCurrentTeam && (
                      <Button
                        size="sm"
                        disabled={joiningTeamId === team.id}
                        onClick={(e) => requestJoin(e, team.id)}
                        className="w-full bg-[#282828] text-xs font-medium text-[#EDEDED] hover:bg-[#333333]"
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        {joiningTeamId === team.id
                          ? "Sending..."
                          : "Join Team"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;