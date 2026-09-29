"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import hackathonService from "@/app/hackathon/hackathonService";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProjectFormValues,
  projectSchema,
} from "@/lib/schema/project/projectSchema";
import {
  AlertTriangle,
  FolderGit2,
  Code2 as Github,
  Globe,
  Loader2,
  Save,
  Send,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  repository_url: string | null;
  demo_url: string | null;
  track_id: string | null;
  status: "DRAFT" | "SUBMITTED";
}

interface Props {
  hackathonId: string;
  record: ProjectRecord | null;
  tracks: { id: string; name: string }[];
  submissionOpen: boolean;
  onCancel: () => void;
  onSaved?: () => void;
}

const inputClass =
  "h-9 rounded-md border border-[#282828] bg-[#121212] px-3 text-xs text-[#EDEDED] outline-none transition-colors placeholder:text-[#555555] focus:border-[#555555] disabled:opacity-50";

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="flex items-center gap-1 text-[11px] text-red-400">
      <AlertTriangle className="h-3 w-3" />
      {message}
    </p>
  ) : null;

const ProjectForm = ({
  hackathonId,
  record,
  tracks,
  submissionOpen,
  onCancel,
  onSaved,
}: Props) => {
  const [busy, setBusy] = React.useState<"save" | "submit" | null>(null);
  const isSubmitted = record?.status === "SUBMITTED";

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: record?.title ?? "",
      description: record?.description ?? "",
      repository_url: record?.repository_url ?? "",
      demo_url: record?.demo_url ?? "",
      track_id: record?.track_id ?? "",
    },
  });

  const persist = async (values: ProjectFormValues): Promise<string | null> => {
    const payload = { ...values, track_id: values.track_id || undefined };

    const response = record
      ? await hackathonService.editDraft(record.id, payload)
      : await hackathonService.createDraft(hackathonId, payload);

    if (!response.success) {
      toast.add({
        title: response.error?.message ?? "Failed to save project",
      });
      return null;
    }
    return record
      ? record.id
      : (response.data as { id?: string } | undefined)?.id ?? "";
  };

  const onSave = async (values: ProjectFormValues) => {
    try {
      setBusy("save");
      const id = await persist(values);
      if (!id) return;
      toast.add({
        title: record ? "Changes saved" : "Draft created",
        description: isSubmitted
          ? undefined
          : "Remember to submit your project before the deadline!",
      });
      onSaved?.();
    } catch (error) {
      console.error("Error while saving project ::: ", error);
      toast.add({ title: "Internal server error" });
    } finally {
      setBusy(null);
    }
  };

  const onSubmitFinal = async (values: ProjectFormValues) => {
    if (tracks.length > 0 && !values.track_id) {
      form.setError("track_id", {
        message: "Please select a track before submitting",
      });
      return;
    }

    try {
      setBusy("submit");
      const id = await persist(values);
      if (!id) return;

      const response = await hackathonService.submitProject(id, hackathonId);
      if (!response.success) {
        toast.add({
          title: response.error?.message ?? "Failed to submit project",
        });
      } else {
        toast.add({ title: "Project submitted successfully!" });
      }
      onSaved?.();
    } catch (error) {
      console.error("Error while submitting project ::: ", error);
      toast.add({ title: "Internal server error" });
    } finally {
      setBusy(null);
    }
  };

  const disabled = !submissionOpen || busy !== null;

  return (
    <Card className="w-full border-[#282828] bg-[#181818] text-[#E0E0E0]">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#282828] pb-4">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-[#888888]" />
          <CardTitle className="text-base font-bold text-[#EDEDED]">
            {record ? "Edit Project Workspace" : "Create Project Submission"}
          </CardTitle>
        </div>

        {record && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
              isSubmitted
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            {isSubmitted ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {record.status}
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {!submissionOpen && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>
              The submission deadline has passed. This project can no longer be edited or submitted.
            </p>
          </div>
        )}

        {/* Project Title */}
        <div className="grid gap-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-[#888888]">
            Project Title
          </Label>
          <Input
            id="title"
            className={inputClass}
            placeholder="e.g. Acme AI Assistant"
            disabled={disabled}
            {...form.register("title")}
          />
          <FieldError message={form.formState.errors.title?.message} />
        </div>

        {/* Description */}
        <div className="grid gap-1.5">
          <Label htmlFor="description" className="text-xs font-semibold text-[#888888]">
            Description
          </Label>
          <textarea
            id="description"
            rows={5}
            className="w-full rounded-md border border-[#282828] bg-[#121212] p-3 text-xs text-[#EDEDED] outline-none transition-colors placeholder:text-[#555555] focus:border-[#555555] disabled:opacity-50"
            placeholder="What problem does your project solve? What technologies did you use?"
            disabled={disabled}
            {...form.register("description")}
          />
          <FieldError message={form.formState.errors.description?.message} />
        </div>

        {/* Track Selection */}
        <div className="grid gap-1.5">
          <Label htmlFor="track_id" className="text-xs font-semibold text-[#888888]">
            Track / Category
          </Label>
          <select
            id="track_id"
            className={inputClass}
            disabled={disabled || tracks.length === 0}
            {...form.register("track_id")}
          >
            <option value="">
              {tracks.length === 0
                ? "No tracks available for this hackathon"
                : "Select a track"}
            </option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.track_id?.message} />
        </div>

        {/* Repository URL */}
        <div className="grid gap-1.5">
          <Label
            htmlFor="repository_url"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#888888]"
          >
            <Github className="h-3.5 w-3.5 text-[#888888]" />
            Repository URL
          </Label>
          <Input
            id="repository_url"
            className={inputClass}
            placeholder="https://github.com/username/repository"
            disabled={disabled}
            {...form.register("repository_url")}
          />
          <FieldError message={form.formState.errors.repository_url?.message} />
        </div>

        {/* Demo URL */}
        <div className="grid gap-1.5">
          <Label
            htmlFor="demo_url"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#888888]"
          >
            <Globe className="h-3.5 w-3.5 text-[#888888]" />
            Live Demo URL <span className="text-[#555555]">(Optional)</span>
          </Label>
          <Input
            id="demo_url"
            className={inputClass}
            placeholder="https://my-demo-app.com"
            disabled={disabled}
            {...form.register("demo_url")}
          />
          <FieldError message={form.formState.errors.demo_url?.message} />
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-[#282828] pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={busy !== null}
          className="border-[#282828] bg-[#121212] text-xs text-[#888888] hover:bg-[#282828] hover:text-[#EDEDED]"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>

        {/* Save Draft Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={form.handleSubmit(onSave)}
          className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] hover:bg-[#282828]"
        >
          {busy === "save" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSubmitted ? "Save Changes" : "Save Draft"}
            </>
          )}
        </Button>

        {/* Submit Final Button */}
        {!isSubmitted && (
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={form.handleSubmit(onSubmitFinal)}
            className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
          >
            {busy === "submit" ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Submit Project
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectForm;