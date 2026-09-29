"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import judgeService from "../judgeService";
import { JudgeHackathon } from "@/app/lib/types";

const Page = () => {
  const router = useRouter();

  const [hackathonList, setHackathonList] = React.useState<JudgeHackathon[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadHackathons = async () => {
      try {
        setLoading(true);

        const response = await judgeService.getMyJudgeHackathon();

        if (!isMounted) return;

        if (response.success) {
          setHackathonList(
            Array.isArray(response.data) ? response.data : [],
          );
        } else {
          toast.add({
            title: response.error?.code ?? "Failed to fetch hackathons",
            description: response.error?.message,
          });
        }
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "Something went wrong while fetching judge hackathons",
          error,
        );

        toast.add({
          title: "Internal server error",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHackathons();

    return () => {
      isMounted = false;
    };
  }, []);

  const goToHackathon = (hackathonId: string) => {
    router.push(`/judge/hackathons/${hackathonId}`);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Not set";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not set";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full bg-black p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold">Judge Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View hackathons where you have accepted a judge invitation.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading hackathons...
            </p>
          ) : hackathonList.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  You have no accepted judge invitations yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            hackathonList.map((hackathon) => (
              <Card
                key={hackathon.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => goToHackathon(hackathon.id)}
              >
                <CardHeader>
                  <CardTitle>{hackathon.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  {hackathon.description && (
                    <p className="text-sm text-muted-foreground">
                      {hackathon.description}
                    </p>
                  )}

                  <p className="mt-2 text-sm">
                    Phase: {hackathon.phase}
                  </p>

                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="text-muted-foreground">
                        Judging starts:{" "}
                      </span>
                      {formatDate(hackathon.judging_start)}
                    </p>

                    <p>
                      <span className="text-muted-foreground">
                        Judging ends:{" "}
                      </span>
                      {formatDate(hackathon.judging_end)}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Assigned tracks
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(hackathon.tracks ?? []).length > 0 ? (
                        hackathon.tracks.map((track) => (
                          <span
                            key={track.id}
                            className="rounded-md bg-muted px-2 py-1 text-sm"
                          >
                            {track.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No tracks assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Projects: {hackathon._count?.projects ?? 0}
                  </p>

                  <p className="mt-4 text-sm font-medium">
                    View hackathon →
                  </p>
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