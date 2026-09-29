"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import React from "react";
import organizerService from "../organizerService";
import { HackathonListItem } from "@/app/lib/types";
import { ArrowLeft, Loader2, Plus, Calendar, Layers } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const [hackathonList, setHackathonList] = React.useState<HackathonListItem[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);

  const goToCreateHackathon = () => {
    router.push("/organizer/create");
  };

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await organizerService.getHackathonList();
        if (!isMounted) return;
        if (response.success) {
          const data = response.data;
          setHackathonList(Array.isArray(data) ? data : []);
        } else {
          toast.add({
            title: response.error?.code ?? "Failed to fetch hackathons",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error(
          "Something went wrong while fetching hackathon list",
          error,
        );
        toast.add({ title: "Internal server error" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation & Header Section */}
        <div className="flex flex-col gap-4 border-b border-[#282828] pb-4 sm:flex-row sm:items-center sm:justify-between">
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
                Organizer Dashboard
              </h1>
              <p className="mt-0.5 text-xs text-[#888888]">
                Manage your active and upcoming hackathons
              </p>
            </div>
          </div>

          <Button
            onClick={goToCreateHackathon}
            className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Start New Hackathon
          </Button>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-xs text-[#888888]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading hackathons...</span>
            </div>
          ) : hackathonList.length === 0 ? (
            <Card className="border-[#282828] bg-[#181818]">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Calendar className="mb-3 h-8 w-8 text-[#555555]" />
                <p className="text-sm font-medium text-[#EDEDED]">
                  No hackathons created yet
                </p>
                <p className="mt-1 text-xs text-[#888888]">
                  Click the button above to host your first event.
                </p>
              </CardContent>
            </Card>
          ) : (
            hackathonList.map((hackathon) => (
              <Card
                key={hackathon.id}
                onClick={() => {
                  router.push(`/organizer/${hackathon.id}/view`);
                }}
                className="cursor-pointer border-[#282828] bg-[#181818] transition-colors hover:border-[#383838] hover:bg-[#1C1C1C]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-[#EDEDED]">
                      {hackathon.title}
                    </CardTitle>
                    <span className="inline-flex items-center rounded-full bg-[#282828] px-2.5 py-0.5 text-[11px] font-medium text-[#A0A0A0]">
                      Phase: {hackathon.phase}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {hackathon.description && (
                    <p className="text-xs text-[#888888] line-clamp-2">
                      {hackathon.description}
                    </p>
                  )}

                  {hackathon.tracks && hackathon.tracks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Layers className="mr-1 h-3.5 w-3.5 text-[#666666]" />
                      {hackathon.tracks.map((track) => (
                        <span
                          key={track.id}
                          className="rounded-md border border-[#2A2A2A] bg-[#121212] px-2 py-0.5 text-[11px] text-[#B0B0B0]"
                        >
                          {track.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;