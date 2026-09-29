"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import hackathonService from "@/app/hackathon/hackathonService";
import ProjectForm from "../../ProjectForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string; project_id: string }>;
}

interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  repository_url: string | null;
  demo_url: string | null;
  track_id: string | null;
  status: "DRAFT" | "SUBMITTED";
}

export default function EditProjectPage({ params }: PageProps) {
  const { hackathon_id, project_id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<{ id: string; name: string }[]>([]);
  const [submissionOpen, setSubmissionOpen] = useState(true);
  const [record, setRecord] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjectAndTracks = async () => {
      try {
        setLoading(true);

        const [projectRes, tracksRes] = await Promise.all([
          hackathonService.getProjectDetail(hackathon_id, project_id),
          hackathonService.getTracks(hackathon_id),
        ]);

        if (!isMounted) return;

        if (tracksRes?.success && Array.isArray(tracksRes.data)) {
          setTracks(tracksRes.data);
        }

        if (projectRes?.success && projectRes.data) {
          setRecord(projectRes.data);
        } else {
          setRecord(null);
          toast.add({
            title: projectRes?.error?.message ?? "Failed to load project details",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load project workspace:", error);
        toast.add({ title: "Internal server error loading project data" });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjectAndTracks();

    return () => {
      isMounted = false;
    };
  }, [hackathon_id, project_id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3 text-xs text-[#888888]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading project details...</span>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-center text-[#E0E0E0]">
          <CardContent className="space-y-4 p-8">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#EDEDED]">
                Project Not Found
              </h2>
              <p className="text-xs text-[#888888]">
                Could not retrieve project data for editing.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] hover:bg-[#282828]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Navigation back button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] transition-colors hover:bg-[#282828]"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>

        {/* Project Form for editing */}
        <ProjectForm
          hackathonId={hackathon_id}
          record={record}
          tracks={tracks}
          submissionOpen={submissionOpen}
          onCancel={() => router.back()}
          onSaved={() => {
            router.back();
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}