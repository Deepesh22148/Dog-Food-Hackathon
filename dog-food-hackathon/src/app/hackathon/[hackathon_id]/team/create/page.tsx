"use client";

import * as React from "react";
import { use } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

import SCHEMA from "@/lib/globalSchema";
import hackathonService from "@/app/hackathon/hackathonService";

interface PageProps {
  params: Promise<{ hackathon_id: string }>;
}

const Page = ({ params }: PageProps) => {
  const { hackathon_id } = use(params);
  const router = useRouter();

  const form = useForm<z.infer<typeof SCHEMA.USER.TEAM>>({
    resolver: zodResolver(SCHEMA.USER.TEAM),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SCHEMA.USER.TEAM>) => {
    try {
      const response = await hackathonService.createTeam(hackathon_id, data);

      if (response.success) {
        toast.add({
          title: "Team created successfully",
          description: "You are now the leader of this team.",
        });

        await router.push(`/hackathon/${hackathon_id}/team`);
        return;
      }

      toast.add({
        title: "Failed to create team",
        description:
          response.error?.message ??
          "Something went wrong while creating the team.",
      });
    } catch (error) {
      console.error("Error while creating team:", error);

      toast.add({
        title: "Error while creating team",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-[#282828] pb-5">
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
              Create Team
            </h1>
            <p className="mt-0.5 text-xs text-[#888888]">
              Form a new team and invite other participants to join.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="flex justify-center pt-4">
          <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardHeader className="border-b border-[#282828] pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#888888]" />
                <CardTitle className="text-base font-semibold text-[#EDEDED]">
                  New Team
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#888888]">
                You will automatically become the designated team leader.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5">
              <form
                id="create-team-form"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="create-team-name"
                          className="text-xs font-medium text-[#EDEDED]"
                        >
                          Team Name
                        </FieldLabel>

                        <Input
                          {...field}
                          id="create-team-name"
                          placeholder="Enter team name"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] placeholder:text-[#666666] focus:border-[#444444]"
                        />

                        {fieldState.invalid && (
                          <FieldError
                            errors={[fieldState.error]}
                            className="text-xs text-red-400"
                          />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t border-[#282828] pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/hackathon/${hackathon_id}/team`)
                }
                disabled={form.formState.isSubmitting}
                className="border-[#2A2A2A] bg-[#121212] text-xs text-[#E0E0E0] hover:bg-[#282828] hover:text-[#FFFFFF]"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="create-team-form"
                disabled={form.formState.isSubmitting}
                className="bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;