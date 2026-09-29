"use client";

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
import SCHEMA from "@/lib/globalSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import z from "zod";
import organizerService from "../organizerService";
import { ArrowLeft, Plus, Trash2, Users, Trophy, Award, Calendar, Layers } from "lucide-react";

const HackathonSchema = SCHEMA.ORGANIZATION.HACKATHON.CREATE;

type HackathonForm = z.input<typeof HackathonSchema>;
type HackathonPayload = z.output<typeof HackathonSchema>;

const initialHackathonState: HackathonForm = {
  title: "",
  description: "",
  registration_start: "",
  registration_end: "",
  submission_deadline: "",
  judging_start: "",
  judging_end: "",
  min_team_size: 1,
  max_team_size: 4,
  tracks: [],
  prizes: [],
  criteria: [
    {
      name: "",
      description: "",
      weight: 100,
      position: 0,
    },
  ],
};

const Page = () => {
  const router = useRouter();

  const form = useForm<HackathonForm, unknown, HackathonPayload>({
    resolver: zodResolver(HackathonSchema),
    defaultValues: initialHackathonState,
  });

  const tracks = useWatch({
    control: form.control,
    name: "tracks",
  });

  const {
    fields: prizeFields,
    append: appendPrize,
    remove: removePrize,
  } = useFieldArray({
    control: form.control,
    name: "prizes",
  });

  const {
    fields: criteriaFields,
    append: appendCriterion,
    remove: removeCriterion,
  } = useFieldArray({
    control: form.control,
    name: "criteria",
  });

  const onSubmit = async (data: HackathonPayload) => {
    try {
      const payload = {
        ...data,
        registration_start: data.registration_start.toISOString(),
        registration_end: data.registration_end.toISOString(),
        submission_deadline: data.submission_deadline.toISOString(),
        judging_start: data.judging_start.toISOString(),
        judging_end: data.judging_end.toISOString(),
      };

      const response = await organizerService.createHackathon(payload);

      if (response.success) {
        toast.add({
          title: "Hackathon created!",
        });
        router.push("/organizer/dashboard");
      } else {
        toast.add({
          title: response.error?.code ?? "Failed to create hackathon",
          description: response.error?.message,
        });
      }
    } catch (error) {
      console.error("Error while submitting form", error);
      toast.add({
        title: "INTERNAL SERVER ERROR",
        description: "Something went wrong while creating hackathon",
      });
    }
  };

  const handleCancel = () => {
    router.push("/organizer/dashboard");
  };

  const addTrack = () => {
    form.setValue("tracks", [...(tracks ?? []), ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeTrack = (index: number) => {
    form.setValue(
      "tracks",
      (tracks ?? []).filter((_, trackIndex) => trackIndex !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 border-b border-[#282828] pb-4">
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
              Create Hackathon
            </h1>
            <p className="mt-0.5 text-xs text-[#888888]">
              Configure details, timeline, team limits, and judging criteria
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-4">
              <CardTitle className="text-base font-semibold text-[#EDEDED]">
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs text-[#A0A0A0]">
                  Hackathon Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Web3 Innovation Summit 2026"
                  className="border-[#282828] bg-[#121212] text-sm text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs text-[#A0A0A0]">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Provide a brief overview of your event"
                  className="border-[#282828] bg-[#121212] text-sm text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Section */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Event Schedule
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
              {(
                [
                  ["registration_start", "Registration Start"],
                  ["registration_end", "Registration End"],
                  ["submission_deadline", "Submission Deadline"],
                  ["judging_start", "Judging Start"],
                  ["judging_end", "Judging End"],
                ] as const
              ).map(([name, label]) => (
                <div key={name} className="grid gap-2">
                  <Label htmlFor={name} className="text-xs text-[#A0A0A0]">
                    {label}
                  </Label>
                  <Input
                    id={name}
                    type="datetime-local"
                    className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] scheme-dark focus-visible:ring-[#383838]"
                    {...form.register(name)}
                  />
                  {form.formState.errors[name] && (
                    <p className="text-xs text-red-400">
                      {form.formState.errors[name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team Settings Section */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Team Settings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="min_team_size" className="text-xs text-[#A0A0A0]">
                  Minimum Team Size
                </Label>
                <Input
                  id="min_team_size"
                  type="number"
                  min={1}
                  className="border-[#282828] bg-[#121212] text-sm text-[#EDEDED] focus-visible:ring-[#383838]"
                  {...form.register("min_team_size", { valueAsNumber: true })}
                />
                {form.formState.errors.min_team_size && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.min_team_size.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_team_size" className="text-xs text-[#A0A0A0]">
                  Maximum Team Size
                </Label>
                <Input
                  id="max_team_size"
                  type="number"
                  min={1}
                  className="border-[#282828] bg-[#121212] text-sm text-[#EDEDED] focus-visible:ring-[#383838]"
                  {...form.register("max_team_size", { valueAsNumber: true })}
                />
                {form.formState.errors.max_team_size && (
                  <p className="text-xs text-red-400">
                    {form.formState.errors.max_team_size.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracks Section */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Tracks
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTrack}
                className="border-[#2A2A2A] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Track
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {(tracks ?? []).length === 0 ? (
                <p className="text-xs text-[#666666]">No tracks added yet.</p>
              ) : (
                (tracks ?? []).map((track, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Track ${index + 1} name`}
                      value={track}
                      className="border-[#282828] bg-[#121212] text-sm text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                      onChange={(event) => {
                        const updatedTracks = [...(tracks ?? [])];
                        updatedTracks[index] = event.target.value;
                        form.setValue("tracks", updatedTracks, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTrack(index)}
                      className="shrink-0 border-[#2A2A2A] bg-[#121212] text-[#888888] hover:border-red-900 hover:bg-red-950 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}

              {form.formState.errors.tracks?.message && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.tracks.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Prizes Section */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Prizes
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendPrize({
                    name: "",
                    description: "",
                    value: "",
                  })
                }
                className="border-[#2A2A2A] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Prize
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {prizeFields.length === 0 ? (
                <p className="text-xs text-[#666666]">No prizes added yet.</p>
              ) : (
                prizeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-md border border-[#282828] bg-[#121212] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#888888]">
                        Prize #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrize(index)}
                        className="h-7 px-2 text-xs text-[#888888] hover:bg-red-950 hover:text-red-400"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[#A0A0A0]">
                          Prize Name
                        </Label>
                        <Input
                          placeholder="e.g. First Place"
                          className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                          {...form.register(`prizes.${index}.name`)}
                        />
                        {form.formState.errors.prizes?.[index]?.name && (
                          <p className="text-xs text-red-400">
                            {form.formState.errors.prizes[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-[11px] text-[#A0A0A0]">
                          Value
                        </Label>
                        <Input
                          placeholder="e.g. ₹50,000"
                          className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                          {...form.register(`prizes.${index}.value`)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-[#A0A0A0]">
                        Description
                      </Label>
                      <Input
                        placeholder="Prize details and perks"
                        className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                        {...form.register(`prizes.${index}.description`)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Judging Criteria Section */}
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  Judging Criteria
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendCriterion({
                    name: "",
                    description: "",
                    weight: 0,
                    position: criteriaFields.length,
                  })
                }
                className="border-[#2A2A2A] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Criterion
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {criteriaFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md border border-[#282828] bg-[#121212] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#888888]">
                      Criterion #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriterion(index)}
                      disabled={criteriaFields.length === 1}
                      className="h-7 px-2 text-xs text-[#888888] hover:bg-red-950 hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1.5 sm:col-span-2">
                      <Label className="text-[11px] text-[#A0A0A0]">
                        Criterion Name
                      </Label>
                      <Input
                        placeholder="e.g. Innovation & Originality"
                        className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                        {...form.register(`criteria.${index}.name`)}
                      />
                      {form.formState.errors.criteria?.[index]?.name && (
                        <p className="text-xs text-red-400">
                          {form.formState.errors.criteria[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-[11px] text-[#A0A0A0]">
                        Weight (%)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] focus-visible:ring-[#383838]"
                        {...form.register(`criteria.${index}.weight`, {
                          valueAsNumber: true,
                        })}
                      />
                      {form.formState.errors.criteria?.[index]?.weight && (
                        <p className="text-xs text-red-400">
                          {form.formState.errors.criteria[index]?.weight?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-[11px] text-[#A0A0A0]">
                      Description
                    </Label>
                    <Input
                      placeholder="What should judges evaluate?"
                      className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] placeholder-[#555555] focus-visible:ring-[#383838]"
                      {...form.register(`criteria.${index}.description`)}
                    />
                  </div>
                </div>
              ))}

              {form.formState.errors.criteria?.message && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.criteria.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-1/2 border-[#2A2A2A] bg-[#181818] text-xs font-semibold text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-1/2 bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
            >
              Create Hackathon
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;