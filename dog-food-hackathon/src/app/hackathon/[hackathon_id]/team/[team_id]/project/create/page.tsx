"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import hackathonService from "@/app/hackathon/hackathonService";
import ProjectForm from "../ProjectForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { hackathon_id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<{ id: string; name: string }[]>([]);
  const [submissionOpen, setSubmissionOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      try {
        setLoading(true);
        const tracksRes = await hackathonService.getTracks(hackathon_id);
        if (isMounted && tracksRes?.success && Array.isArray(tracksRes.data)) {
          setTracks(tracksRes.data);
        }
      } catch (error) {
        console.error("Failed to load tracks:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      isMounted = false;
    };
  }, [hackathon_id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <div className="flex items-center gap-3 text-xs text-[#888888]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading workspace...</span>
        </div>
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

        {/* Project Form */}
        <ProjectForm
          hackathonId={hackathon_id}
          record={null}
          tracks={tracks}
          submissionOpen={submissionOpen}
          onCancel={() => router.back()}
          onSaved={() => {
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}