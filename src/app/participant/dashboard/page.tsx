"use client";

import React from "react";
import pariticipantService from "../pariticipantService";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

type Track = {
  id: string;
  name: string;
};

type ActiveHackathon = {
  id: string;
  title: string;
  description: string | null;
  registration_start: string;
  registration_end: string;
  submission_deadline: string;
  tracks: Track[];
};

type UserProfile = {
  name?: string;
  email?: string;
  is_organizer?: boolean;
};

const DashboardPage = () => {
  const router = useRouter();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [activeHackathonList, setActiveHackathonList] = React.useState<
    ActiveHackathon[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [participatingId, setParticipatingId] = React.useState<string | null>(
    null
  );
  const [refreshKey, setRefreshKey] = React.useState(false);

  const loadEssentials = async () => {
    setLoading(true);
    try {
      const [userRes, hackathonsRes] = await Promise.all([
        pariticipantService.aboutMe(),
        pariticipantService.getActiveHackathonList(),
      ]);

      if (userRes.success) {
        setUser(userRes.data);
      } else {
        toast.add({
          title: "Failed to fetch user profile",
          description:
            userRes.error?.message || "Could not load user details.",
        });
      }

      if (hackathonsRes.success) {
        setActiveHackathonList(
          Array.isArray(hackathonsRes.data)
            ? (hackathonsRes.data as ActiveHackathon[])
            : []
        );
      } else {
        toast.add({
          title: hackathonsRes.error?.code ?? "FETCH_FAILED",
          description:
            hackathonsRes.error?.message ??
            "Something went wrong while fetching hackathons.",
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.add({
        title: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong while loading the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadEssentials();
  }, [refreshKey]);

  const handleElevateRole = async () => {
    try {
      const response = await pariticipantService.elevateRole();

      if (response.success) {
        toast.add({
          title: "Request Sent!",
          description: "Your request for organizer elevation is submitted.",
        });
      } else {
        if (response.error?.code === "INTERNAL_ERROR") {
          toast.add({
            title: "Request Error",
            description: "Something went wrong while processing your request.",
          });
          return;
        }

        toast.add({
          title: "Request Already Exists",
          description: "You already have a pending elevation request.",
        });
      }
    } catch (error) {
      console.error("Failed to request elevation:", error);
      toast.add({
        title: "Request Error",
        description: "Could not send the elevation request.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const response = await pariticipantService.logoutUser();

      if (!response.success) {
        throw new Error(response.message || "Logout failed");
      }

      toast.add({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });

      router.push("/login");
    } catch (error) {
      console.error("ERROR during logout:", error);
      toast.add({
        title: "Logout Error",
        description: "Something went wrong while logging out.",
      });
    }
  };

  const handleParticipate = async (hackathonId: string) => {
    try {
      setParticipatingId(hackathonId);
      const response = await pariticipantService.participateHackathon(
        hackathonId
      );

      if (response.success) {
        toast.add({
          title: "Success",
          description: "You are now participating in this hackathon!",
        });
        setRefreshKey((prev) => !prev);
      } else {
        toast.add({
          title: response.error?.code ?? "PARTICIPATION_FAILED",
          description:
            response.error?.message ?? "Failed to participate in hackathon.",
        });
      }
    } catch (error) {
      console.error("Failed to participate in hackathon:", error);
      toast.add({
        title: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong while participating.",
      });
    } finally {
      setParticipatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-[#2A2A2A] bg-[#181818]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-[#EDEDED]">
              Participant Dashboard
            </h1>
            {user?.name && (
              <span className="rounded-full bg-[#262626] border border-[#3A3A3A] px-3 py-0.5 text-xs font-medium text-[#A0A0A0]">
                {user.name}
              </span>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#333333] bg-[#222222] text-[#D4D4D4] hover:bg-[#2C2C2C] hover:text-[#FFFFFF]"
              onClick={() => router.push("/participant/participated-list")}
            >
              History
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-[#333333] bg-[#222222] text-[#D4D4D4] hover:bg-[#2C2C2C] hover:text-[#FFFFFF]"
              onClick={() => router.push("/participant/judge")}
            >
              Judge
            </Button>

            {user?.is_organizer ? (
              <Button
                size="sm"
                className="bg-[#E0E0E0] text-[#121212] hover:bg-[#FFFFFF]"
                onClick={() => router.push("/organizer/dashboard")}
              >
                Organizer Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#3A3A3A] bg-[#262626] text-[#D4D4D4] hover:bg-[#333333] hover:text-[#FFFFFF]"
                onClick={handleElevateRole}
              >
                Elevate Role
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="bg-[#2A1818] border border-[#4A2020] text-[#E58888] hover:bg-[#3A1E1E] hover:text-[#FF9999]"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-tight text-[#EDEDED]">
            Active Hackathons
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Explore ongoing events and participate directly from here.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[#262626] bg-[#181818] p-8">
            <p className="animate-pulse text-xs font-medium text-[#777777]">
              Loading active hackathons...
            </p>
          </div>
        ) : activeHackathonList.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A2A] bg-[#181818] p-8 text-center">
            <p className="text-sm font-medium text-[#A0A0A0]">
              No active hackathons available
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              Check back later for new events.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {activeHackathonList.map((hackathon) => (
              <div
                key={hackathon.id}
                className="flex flex-col justify-between rounded-xl border border-[#282828] bg-[#181818] p-5 transition-colors hover:border-[#383838]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-[#E0E0E0]">
                      {hackathon.title}
                    </h3>

                    <Button
                      size="sm"
                      className="bg-[#2A2A2A] text-[#E0E0E0] border border-[#3A3A3A] hover:bg-[#383838] hover:text-[#FFFFFF]"
                      onClick={() => handleParticipate(hackathon.id)}
                      disabled={participatingId === hackathon.id}
                    >
                      {participatingId === hackathon.id
                        ? "Joining..."
                        : "Participate"}
                    </Button>
                  </div>

                  {hackathon.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#999999] line-clamp-3">
                      {hackathon.description}
                    </p>
                  )}

                  {/* Tracks */}
                  {hackathon.tracks && hackathon.tracks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">
                        Tracks
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {hackathon.tracks.map((track) => (
                          <span
                            key={track.id}
                            className="rounded-md border border-[#2C2C2C] bg-[#202020] px-2 py-0.5 text-[11px] font-medium text-[#B0B0B0]"
                          >
                            {track.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Deadlines Footer */}
                <div className="mt-5 border-t border-[#222222] pt-3 text-[11px] text-[#777777]">
                  <div className="flex justify-between py-0.5">
                    <span>Registration ends:</span>
                    <span className="font-medium text-[#AAAAAA]">
                      {new Date(hackathon.registration_end).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Submission deadline:</span>
                    <span className="font-medium text-[#AAAAAA]">
                      {new Date(
                        hackathon.submission_deadline
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;