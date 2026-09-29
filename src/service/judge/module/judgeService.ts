import prismaClient from "@/app/lib/prisma/prismaClient";

type SubmitReviewPayload = {
  project_id: string;
  scores: Record<string, number>;
  comment?: string;
};

const judgeService = {
  getParticipantJudgeList: async (user_id: string) => {
    try {
      const invitations = await prismaClient.hackathonJudge.findMany({
        where: {
          user_id,
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          responded_at: true,

          hackathon: {
            select: {
              id: true,
              title: true,
              description: true,
              phase: true,
              registration_end: true,
              submission_deadline: true,
              judging_start: true,
              judging_end: true,

              tracks: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          hackathonJudgeTracks: {
            select: {
              track: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const result = invitations.map((invitation) => ({
        id: invitation.id,

        hackathon: {
          id: invitation.hackathon.id,
          title: invitation.hackathon.title,
          description: invitation.hackathon.description,
          phase: invitation.hackathon.phase,

          registration_end: invitation.hackathon.registration_end,

          submission_deadline: invitation.hackathon.submission_deadline,

          judging_start: invitation.hackathon.judging_start,

          judging_end: invitation.hackathon.judging_end,
        },

        status: invitation.status,

        tracks: invitation.hackathonJudgeTracks.map((item) => item.track),

        created_at: invitation.created_at,
        responded_at: invitation.responded_at,
      }));

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("getJudgeInvitations :: service failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
  acceptInvitation: async (hackathon_id: string, user_id: string) => {
    try {
      const invitation = await prismaClient.hackathonJudge.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
      });

      if (!invitation) {
        return {
          success: false,
          error: "INVITATION_NOT_FOUND",
        };
      }

      if (invitation.status !== "PENDING") {
        return {
          success: false,
          error: "INVITATION_ALREADY_RESPONDED",
        };
      }

      const updatedInvitation = await prismaClient.hackathonJudge.update({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        data: {
          status: "ACCEPTED",
          responded_at: new Date(),
        },
      });

      return {
        success: true,
        data: updatedInvitation,
      };
    } catch (error) {
      console.error("acceptInvitation :: service failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },

  rejectInvitation: async (hackathon_id: string, user_id: string) => {
    try {
      const invitation = await prismaClient.hackathonJudge.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
      });

      if (!invitation) {
        return {
          success: false,
          error: "INVITATION_NOT_FOUND",
        };
      }

      if (invitation.status !== "PENDING") {
        return {
          success: false,
          error: "INVITATION_ALREADY_RESPONDED",
        };
      }

      const updatedInvitation = await prismaClient.hackathonJudge.update({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        data: {
          status: "REJECTED",
          responded_at: new Date(),
        },
      });

      return {
        success: true,
        data: updatedInvitation,
      };
    } catch (error) {
      console.error("rejectInvitation :: service failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },

  getMyJudgeHackathons: async (user_id: string) => {
    try {
      const hackathons = await prismaClient.hackathon.findMany({
        where: {
          judges: {
            some: {
              user_id,
              status: "ACCEPTED",
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          phase: true,
          judging_start: true,
          judging_end: true,
          tracks: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              projects: true,
            },
          },
        },
        orderBy: {
          judging_start: "asc",
        },
      });

      return {
        success: true,
        data: hackathons,
      };
    } catch (error) {
      console.error("getMyJudgeHackathons :: service failed:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch judge hackathons.",
        },
      };
    }
  },
  getHackathonDetails: async (hackathon_id: string, user_id: string) => {
    try {
      const judgeAssignment = await prismaClient.hackathonJudge.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        include: {
          hackathonJudgeTracks: {
            select: {
              track_id: true,
            },
          },
        },
      });

      if (!judgeAssignment || judgeAssignment.status !== "ACCEPTED") {
        return {
          success: false,
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "You are not an accepted judge for this hackathon.",
          },
        };
      }

      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathon_id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          phase: true,
          judging_start: true,
          judging_end: true,

          tracks: {
            select: {
              id: true,
              name: true,
            },
          },

          criteria: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              name: true,
              description: true,
              weight: true,
              position: true,
            },
          },
        },
      });

      if (!hackathon) {
        return {
          success: false,
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Hackathon not found.",
          },
        };
      }

      const assignedTrackIds = judgeAssignment.hackathonJudgeTracks.map(
        (track) => track.track_id,
      );

      const now = new Date();

      const judgingWindowOpen =
        now >= hackathon.judging_start && now <= hackathon.judging_end;

      let projects: any[] = [];

      if (judgingWindowOpen && assignedTrackIds.length > 0) {
        projects = await prismaClient.project.findMany({
          where: {
            hackathon_id,
            status: "SUBMITTED",
            track_id: {
              in: assignedTrackIds,
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            repository_url: true,
            demo_url: true,
            submitted_at: true,
            track_id: true,
          },
          orderBy: {
            submitted_at: "asc",
          },
        });
      }

      return {
        success: true,
        data: {
          ...hackathon,
          assignedTrackIds,
          projects,
        },
        error: null,
      };
    } catch (error) {
      console.error("Error fetching assigned hackathon details:", error);

      return {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch hackathon details.",
        },
      };
    }
  },
  submitReview: async (user_id: string, payload: SubmitReviewPayload) => {
    try {
      const { project_id, scores, comment } = payload ?? {};

      if (!project_id || !scores || typeof scores !== "object") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid review payload",
          },
        };
      }

      const result = await prismaClient.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
          where: { id: project_id },
          include: {
            hackathon: {
              include: {
                criteria: {
                  orderBy: { position: "asc" },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    weight: true,
                    position: true,
                  },
                },
              },
            },
            track: true,
          },
        });

        if (!project) {
          return {
            success: false as const,
            error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
          };
        }

        if (project.status !== "SUBMITTED") {
          return {
            success: false as const,
            error: {
              code: "PROJECT_NOT_SUBMITTED",
              message: "Only submitted projects can be reviewed",
            },
          };
        }

        const judgeAssignment = await tx.hackathonJudge.findUnique({
          where: {
            user_id_hackathon_id: {
              user_id,
              hackathon_id: project.hackathon_id,
            },
          },
          include: { hackathonJudgeTracks: { select: { track_id: true } } },
        });

        if (!judgeAssignment || judgeAssignment.status !== "ACCEPTED") {
          return {
            success: false as const,
            error: {
              code: "NOT_ACCEPTED_JUDGE",
              message: "You are not an accepted judge for this hackathon",
            },
          };
        }

        if (!project.track_id) {
          return {
            success: false as const,
            error: {
              code: "NO_TRACK",
              message: "Project is not assigned to a track",
            },
          };
        }

        const assignedTrackIds = judgeAssignment.hackathonJudgeTracks.map(
          (t) => t.track_id,
        );
        if (!assignedTrackIds.includes(project.track_id)) {
          return {
            success: false as const,
            error: {
              code: "TRACK_NOT_ASSIGNED",
              message: "You are not assigned to this project's track",
            },
          };
        }

        const now = new Date();
        const hackathon = project.hackathon;

        if (
          hackathon.phase !== "JUDGING" ||
          now < hackathon.judging_start ||
          now > hackathon.judging_end
        ) {
          return {
            success: false as const,
            error: {
              code: "JUDGING_CLOSED",
              message:
                "Reviews can only be submitted during the judging period",
            },
          };
        }

        const criteriaIds = hackathon.criteria.map((c) => c.id);
        const submittedIds = Object.keys(scores);

        if (
          submittedIds.length !== criteriaIds.length ||
          criteriaIds.some(
            (id) => !Object.prototype.hasOwnProperty.call(scores, id),
          ) ||
          submittedIds.some((id) => !criteriaIds.includes(id))
        ) {
          return {
            success: false as const,
            error: {
              code: "INCOMPLETE_SCORES",
              message: "A score is required for every review criterion",
            },
          };
        }

        for (const value of Object.values(scores)) {
          if (!Number.isInteger(value) || value < 1 || value > 5) {
            return {
              success: false as const,
              error: {
                code: "INVALID_SCORE",
                message: "Each score must be an integer between 1 and 5",
              },
            };
          }
        }

        // Review.judge_id references HackathonJudge.id, not User.id
        const existingReview = await tx.review.findUnique({
          where: {
            judge_id_project_id: { judge_id: judgeAssignment.id, project_id },
          },
        });

        if (existingReview?.status === "SUBMITTED") {
          return {
            success: false as const,
            error: {
              code: "ALREADY_SUBMITTED",
              message: "This review has already been submitted",
            },
          };
        }

        if (existingReview) {
          return {
            success: false as const,
            error: {
              code: "REVIEW_EXISTS",
              message: "A review already exists for this project",
            },
          };
        }

        const review = await tx.review.create({
          data: {
            judge_id: judgeAssignment.id,
            project_id,
            comment: comment?.trim() || null,
            status: "SUBMITTED",
            submitted_at: now,
            scores: {
              create: criteriaIds.map((criterion_id) => ({
                criterion_id,
                value: scores[criterion_id],
              })),
            },
          },
          include: { scores: { select: { criterion_id: true, value: true } } },
        });

        return { success: true as const, data: review };
      });

      return result;
    } catch (error) {
      console.error("submitReview ::: Error:", error);
      return {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to submit review" },
      };
    }
  },
  getProjectDetails: async (
    project_id: string,
    hackathon_id: string,
    user_id: string,
  ) => {
    const judgeAssignment = await prismaClient.hackathonJudge.findUnique({
      where: {
        user_id_hackathon_id: {
          user_id,
          hackathon_id,
        },
      },
      include: {
        hackathonJudgeTracks: {
          select: { track_id: true },
        },
      },
    });

    if (!judgeAssignment || judgeAssignment.status !== "ACCEPTED") {
      throw new Error("You are not an accepted judge for this hackathon");
    }

    const project = await prismaClient.project.findFirst({
      where: {
        id: project_id,
        hackathon_id,
        status: "SUBMITTED",
      },
      include: {
        track: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            phase: true,
            judging_start: true,
            judging_end: true,
            criteria: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                weight: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error("Submitted project not found");
    }

    if (!project.track_id) {
      throw new Error("Project is not assigned to a track");
    }

    const assignedTrackIds = judgeAssignment.hackathonJudgeTracks.map(
      (item) => item.track_id,
    );

    if (!assignedTrackIds.includes(project.track_id)) {
      throw new Error("You are not assigned to this project's track");
    }

    const existingReview = await prismaClient.review.findUnique({
      where: {
        judge_id_project_id: {
          judge_id: judgeAssignment.id,
          project_id,
        },
      },
      include: {
        scores: {
          select: {
            criterion_id: true,
            value: true,
          },
        },
      },
    });

    return {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        repository_url: project.repository_url,
        demo_url: project.demo_url,
        submitted_at: project.submitted_at,
        track: project.track,
        team: project.team,
      },
      hackathon: project.hackathon,
      criteria: project.hackathon.criteria,
      review: existingReview,
      isSubmitted: existingReview?.status === "SUBMITTED",
    };
  },
  getJudgeScore: async (user_id: string) => {
    try {
      const reviews = await prismaClient.review.findMany({
        where: {
          status: "SUBMITTED",
          judge: {
            user_id,
          },
        },
        select: {
          id: true,
          comment: true,
          submitted_at: true,

          project: {
            select: {
              id: true,
              title: true,
              track: {
                select: {
                  id: true,
                  name: true,
                },
              },
              hackathon: {
                select: {
                  id: true,
                  title: true,
                  phase: true,
                },
              },
            },
          },

          scores: {
            select: {
              criterion_id: true,
              value: true,
              criterion: {
                select: {
                  id: true,
                  name: true,
                  weight: true,
                },
              },
            },
          },
        },
        orderBy: {
          submitted_at: "desc",
        },
      });

      return {
        success: true,
        data: reviews,
        error: null,
      };
    } catch (error) {
      console.error("getJudgeScore :: service failed:", error);

      return {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch judge scores.",
        },
      };
    }
  },
};

export default judgeService;
