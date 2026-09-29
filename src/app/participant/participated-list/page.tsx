"use client";

import React from "react";
import { toast } from "@/components/ui/toast";
import pariticipantService from "../pariticipantService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantHackathonHistoryItem } from "@/app/lib/types";
import HackathonTable from "./HackathonTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [currentHackathonList, setCurrentHackathonList] = React.useState<
    ParticipantHackathonHistoryItem[]
  >([]);

  const [pastHackathonList, setPastHackathonList] = React.useState<
    ParticipantHackathonHistoryItem[]
  >([]);

  const [upcomingHackathonList, setUpcomingHackathonList] = React.useState<
    ParticipantHackathonHistoryItem[]
  >([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const getHackathonHistory = async () => {
    setIsLoading(true);
    try {
      const response = await pariticipantService.getHackathonHistory();
      if (response.success) {
        setCurrentHackathonList(response.data?.currentHackathons ?? []);
        setPastHackathonList(response.data?.pastHackathons ?? []);
        setUpcomingHackathonList(response.data?.upcomingHackathons ?? []);
      } else {
        toast.add({
          title:
            response.error?.code ?? "Error while fetching hackathon history",
          description:
            response.error?.message ??
            "Something went wrong while fetching hackathon history",
        });
      }
    } catch (error) {
      console.error("Error while fetching hackathon history:", error);
      toast.add({
        title: "Error while fetching hackathon history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamFormation = async (
    participation: ParticipantHackathonHistoryItem,
  ) => {
    await router.push(`/hackathon/${participation.hackathon.id}/team`);
  };

  const handleResign = async () => {};

  const handleViewGallery = async () => {};

  const handleViewHackathon = async (
    participation: ParticipantHackathonHistoryItem,
  ) => {
    await router.push(`/hackathon/${participation.hackathon.id}/view`);
  };

  React.useEffect(() => {
    getHackathonHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#E0E0E0] antialiased md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section with Back Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
              My Hackathons
            </h1>
            <p className="mt-1 text-xs text-[#888888]">
              View your upcoming, current, and past hackathons.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-[#2C2C2C] bg-[#181818] text-[#B0B0B0] hover:bg-[#252525] hover:text-[#FFFFFF]"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#282828] bg-[#181818] p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#777777]">
              Current
            </span>
            <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
              {currentHackathonList.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#282828] bg-[#181818] p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#777777]">
              Upcoming
            </span>
            <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
              {upcomingHackathonList.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#282828] bg-[#181818] p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#777777]">
              Past
            </span>
            <p className="mt-1 text-2xl font-bold text-[#EDEDED]">
              {pastHackathonList.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="current" className="w-full space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-lg border border-[#2A2A2A] bg-[#181818] p-1 text-[#888888]">
            <TabsTrigger
              value="current"
              className="rounded-md px-4 py-1.5 text-xs font-medium text-[#A0A0A0] transition-colors hover:bg-[#222222] hover:text-[#E0E0E0] data-[state=active]:bg-[#282828] data-[state=active]:text-[#FFFFFF] data-[state=active]:shadow-none"
            >
              Current ({currentHackathonList.length})
            </TabsTrigger>

            <TabsTrigger
              value="upcoming"
              className="rounded-md px-4 py-1.5 text-xs font-medium text-[#A0A0A0] transition-colors hover:bg-[#222222] hover:text-[#E0E0E0] data-[state=active]:bg-[#282828] data-[state=active]:text-[#FFFFFF] data-[state=active]:shadow-none"
            >
              Upcoming ({upcomingHackathonList.length})
            </TabsTrigger>

            <TabsTrigger
              value="past"
              className="rounded-md px-4 py-1.5 text-xs font-medium text-[#A0A0A0] transition-colors hover:bg-[#222222] hover:text-[#E0E0E0] data-[state=active]:bg-[#282828] data-[state=active]:text-[#FFFFFF] data-[state=active]:shadow-none"
            >
              Past ({pastHackathonList.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-[#262626] bg-[#181818]">
              <p className="animate-pulse text-xs font-medium text-[#777777]">
                Loading hackathon history...
              </p>
            </div>
          ) : (
            <>
              <TabsContent
                value="current"
                className="m-0 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-[#282828] bg-[#181818] p-2">
                  {currentHackathonList.length > 0 ? (
                    <HackathonTable
                      hackathons={currentHackathonList}
                      actions={[
                        {
                          label: "View",
                          onClick: handleViewHackathon,
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState message="No active hackathons." />
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="upcoming"
                className="m-0 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-[#282828] bg-[#181818] p-2">
                  {upcomingHackathonList.length > 0 ? (
                    <HackathonTable
                      hackathons={upcomingHackathonList}
                      actions={[
                        {
                          label: "Team Formation",
                          onClick: handleTeamFormation,
                        },

                        {
                          label: "View",
                          onClick: handleViewHackathon,
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState message="No upcoming hackathons." />
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="past"
                className="m-0 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-[#282828] bg-[#181818] p-2">
                  {pastHackathonList.length > 0 ? (
                    <HackathonTable
                      hackathons={pastHackathonList}
                      actions={[
                        {
                          label: "View Gallery",
                          onClick: handleViewGallery,
                        },
                      ]}
                    />
                  ) : (
                    <EmptyState message="No past hackathons." />
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-xs font-medium text-[#777777]">{message}</p>
  </div>
);

export default Page;
