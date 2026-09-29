import SCHEMA from "@/lib/globalSchema";
import prismaClient from "@/app/lib/prisma/prismaClient";
import z from "zod";

const hackathonSchema = SCHEMA.ORGANIZATION.HACKATHON.CREATE;

type HackathonForm = z.infer<typeof hackathonSchema>;

const hackathonService = {
  create: async (userId: string, data: HackathonForm) => {
    try {
      const hackathon = await prismaClient.hackathon.create({
        data: {
          title: data.title,
          description: data.description,
          registration_start: data.registration_start,
          registration_end: data.registration_end,
          submission_deadline: data.submission_deadline,
          judging_start: data.judging_start,
          judging_end: data.judging_end,
          organizer_id: userId,
          min_team_size: data.min_team_size,
          max_team_size: data.max_team_size,

          tracks: {
            create: data.tracks.map((track) => ({
              name: track,
            })),
          },

          prizes: {
            create: data.prizes.map((prize, index) => ({
              title: prize.name,
              description: prize.description || null,
              amount_usd:
                prize.value?.trim() !== "" ? Number(prize.value) : null,
              position: index + 1,
            })),
          },

          criteria: {
            create: data.criteria.map((criterion) => ({
              name: criterion.name,
              description: criterion.description,
              weight: criterion.weight,
              position: criterion.position,
            })),
          },
        },
        include: {
          tracks: true,
          prizes: true,
          criteria: true,
        },
      });

      return {
        success: true,
        data: hackathon,
      };
    } catch (error) {
      console.error("create :: hackathonService failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
  getAllHackathons: async (userId: string) => {
    try {
      const hackathons = await prismaClient.hackathon.findMany({
        where: {
          organizer_id: userId,
        },
        include: {
          tracks: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        success: true,
        data: hackathons,
      };
    } catch (error) {
      console.error("getAllHackathons :: hackathonService failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
  getHackathonDetails: async (hackathon_id: string, user_id: string) => {
    try {
      const hackathon = await prismaClient.hackathon.findFirst({
        where: {
          id: hackathon_id,
          organizer_id: user_id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          phase: true,

          registration_start: true,
          registration_end: true,
          submission_deadline: true,
          judging_start: true,
          judging_end: true,

          created_at: true,
          updated_at: true,

          tracks: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              participants: true,
              teams: true,
              judges: true,
              tracks: true,
            },
          },
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: "HACKATHON_NOT_FOUND",
        };
      }

      return {
        success: true,
        data: hackathon,
      };
    } catch (error) {
      console.error("getHackathonDetails :: hackathonService failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
  getJudgeList: async (hackathon_id: string, user_id: string) => {
    try {
      const hackathon = await prismaClient.hackathon.findFirst({
        where: {
          id: hackathon_id,
          organizer_id: user_id,
        },
        select: {
          id: true,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: "HACKATHON_NOT_FOUND",
        };
      }

      const users = await prismaClient.user.findMany({
        where: {
          participantEntries: {
            none: {
              hackathon_id: hackathon_id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          judgeEntries: {
            where: {
              hackathon_id: hackathon_id,
            },
            select: {
              status: true,
            },
          },
        },
      });

      const judgeList = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        judgeStatus: user.judgeEntries[0]?.status ?? null,
      }));

      return {
        success: true,
        data: judgeList,
      };
    } catch (error) {
      console.error("getJudgeList :: organizerService failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
  sendInvitation: async (
    hackathon_id: string,
    judge_id: string,
    tracks: string[],
    user_id: string,
  ) => {
    try {
      // user_id = organizer
      console.log("SEND INVITATION PARAMS", {
        hackathon_id,
        judge_id,
        tracks,
        user_id,
      });
      const hackathon = await prismaClient.hackathon.findFirst({
        where: {
          id: hackathon_id,
          organizer_id: user_id,
        },
        select: {
          id: true,
          registration_end: true,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: "HACKATHON_NOT_FOUND",
        };
      }

      if (new Date() >= hackathon.registration_end) {
        return {
          success: false,
          error: "REGISTRATION_ENDED",
        };
      }

      // A judge must be assigned to at least one track
      if (tracks.length === 0) {
        return {
          success: false,
          error: "NO_TRACKS_SELECTED",
        };
      }

      // Make sure the selected tracks actually belong
      // to this hackathon.
      const hackathonTracks = await prismaClient.hackathonTrack.findMany({
        where: {
          id: {
            in: tracks,
          },
          hackathon_id,
        },
        select: {
          id: true,
        },
      });

      // If the number doesn't match, at least one
      // supplied track ID doesn't belong to this hackathon.
      if (hackathonTracks.length !== tracks.length) {
        return {
          success: false,
          error: "INVALID_TRACKS",
        };
      }

      // User cannot be both participant and judge
      // in the same hackathon.
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id: judge_id,
            hackathon_id,
          },
        },
      });

      if (participant) {
        return {
          success: false,
          error: "USER_IS_PARTICIPANT",
        };
      }

      // Check whether an invitation already exists.
      const judge = await prismaClient.hackathonJudge.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id: judge_id,
            hackathon_id,
          },
        },
      });

      if (judge) {
        return {
          success: false,
          error: "INVITATION_EXISTS",
        };
      }

      // Create judge + track assignments atomically.
      const createdJudge = await prismaClient.$transaction(async (tx) => {
        const judge = await tx.hackathonJudge.create({
          data: {
            user_id: judge_id,
            hackathon_id,
            status: "PENDING",
          },
        });

        await tx.hackathonJudgeTrack.createMany({
          data: tracks.map((track_id) => ({
            judge_id: judge.id,
            track_id,
          })),
        });

        return judge;
      });

      return {
        success: true,
        data: createdJudge,
      };
    } catch (error) {
      console.error("sendInvitation :: service failed:", error);

      return {
        success: false,
        error: "INTERNAL_ERROR",
      };
    }
  },
};

export default hackathonService;
