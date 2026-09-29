"use client";

import hackathonService from "@/app/hackathon/hackathonService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";

interface PageProps {
  params: Promise<{ hackathon_id: string; team_id: string }>;
}

const Page = ({ params }: PageProps) => {
  const searchParams = useSearchParams();
  const { hackathon_id } = use(params);

  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    router.push("/participant/dashboard");
    return <div>Unauthorized access!</div>;
  }

  const handleJoin = async () => {
    try {
      setLoading(true);

      const response = await hackathonService.joinTeamViaLink(
        hackathon_id,
        token,
      );

      if (!response.success) {
        toast.add({
          title: "Unable to join team",
          description:
            response.error?.message ??
            "Something went wrong while joining the team.",
        });
        return;
      }

      setSuccess(true);

      toast.add({
        title: "Join request sent",
        description:
          "Your request has been sent to the team leader for approval.",
      });
    } catch (error) {
      console.error("handleJoin ::: Error:", error);

      toast.add({
        title: "Error",
        description: "Unable to process the team invite.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Request Sent!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your request to join the team has been sent to the team leader.
              You will become a team member once they accept your request.
            </p>

            <Button
              className="w-full"
              onClick={() =>
                router.push(`/hackathon/${hackathon_id}/teams`)
              }
            >
              Back to Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You've Been Invited!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            You have been invited to join a team in this hackathon.
          </p>

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "Sending Request..." : "Join Team"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
