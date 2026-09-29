import prismaClient from "@/app/lib/prisma/prismaClient";
import crypto from "crypto";

const hackathonService = {
  getActiveHackathons: async (userId?: string) => {
    try {
      const activeHackathons = await prismaClient.hackathon.findMany({
        where: {
          phase: "REGISTRATION",
          registration_start: {
            lte: new Date(),
          },
          registration_end: {
            gte: new Date(),
          },
          ...(userId && {
            participants: {
              none: {
                user_id: userId,
              },
            },
            judges: {
              none: {
                user_id: userId,
              },
            },
          }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          registration_start: true,
          registration_end: true,
          submission_deadline: true,
          tracks: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          registration_end: "asc",
        },
      });

      return {
        success: true,
        data: activeHackathons,
      };
    } catch (error) {
      console.error("getActiveHackathons ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch active hackathons",
        },
      };
    }
  },
  participateHackathon: async (userId: string, hackathon_id: string) => {
    try {
      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathon_id,
        },
        select: {
          id: true,
          organizer_id: true,
          registration_start: true,
          registration_end: true,
        },
      });

      const existingJudge = await prismaClient.hackathonJudge.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id: userId,
            hackathon_id,
          },
        },
      });

      if (existingJudge) {
        return {
          success: false,
          error: {
            code: "JUDGE_CANNOT_PARTICIPATE",
            message: "A judge cannot participate in the same hackathon",
          },
        };
      }

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      if (hackathon.organizer_id === userId) {
        return {
          success: false,
          error: {
            code: "ORGANIZER_CANNOT_PARTICIPATE",
            message: "Organizer cannot participate in their own hackathon",
          },
        };
      }

      const now = new Date();

      if (
        now < hackathon.registration_start ||
        now > hackathon.registration_end
      ) {
        return {
          success: false,
          error: {
            code: "REGISTRATION_CLOSED",
            message: "Hackathon registration is not currently open",
          },
        };
      }

      const existingParticipant =
        await prismaClient.hackathonParticipant.findUnique({
          where: {
            user_id_hackathon_id: {
              user_id: userId,
              hackathon_id: hackathon_id,
            },
          },
        });

      if (existingParticipant) {
        return {
          success: false,
          error: {
            code: "ALREADY_PARTICIPATING",
            message: "User is already participating in this hackathon",
          },
        };
      }

      const participant = await prismaClient.hackathonParticipant.create({
        data: {
          user_id: userId,
          hackathon_id: hackathon_id,
          team_id: null,
        },
      });

      return {
        success: true,
        data: participant,
      };
    } catch (error) {
      console.error("participateHackathon ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to participate in hackathon",
        },
      };
    }
  },
  getHackathonHistory: async (userId: string) => {
    try {
      const now = new Date();

      const participations = await prismaClient.hackathonParticipant.findMany({
        where: {
          user_id: userId,
        },
        select: {
          id: true,
          team_id: true,
          hackathon: {
            select: {
              id: true,
              title: true,
              description: true,
              registration_start: true,
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
        },
        orderBy: {
          hackathon: {
            judging_end: "desc",
          },
        },
      });

      const pastHackathons = participations.filter(
        (participation) => participation.hackathon.judging_end < now,
      );

      const upcomingHackathons = participations.filter(
        (participation) => participation.hackathon.registration_end > now,
      );

      const currentHackathons = participations.filter(
        (participation) =>
          participation.hackathon.registration_end < now &&
          participation.hackathon.judging_end >= now,
      );

      return {
        success: true,
        data: {
          upcomingHackathons,
          currentHackathons,
          pastHackathons,
        },
      };
    } catch (error) {
      console.error("getHackathonHistory ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch hackathon history",
        },
      };
    }
  },
  getTeamList: async (userId: string, hackathonId: string) => {
    try {
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id: userId,
            hackathon_id: hackathonId,
          },
        },
        select: {
          team_id: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      const teams = await prismaClient.team.findMany({
        where: {
          hackathon_id: hackathonId,
        },
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
          participants: {
            select: {
              id: true,
              user_id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "asc",
        },
      });

      return {
        success: true,
        data: {
          currentTeamId: participant.team_id,
          teams,
        },
      };
    } catch (error) {
      console.error("getTeamList ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch team list",
        },
      };
    }
  },
  createTeam: async (user_id: string, hackathonId: string, name: string) => {
    try {
      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathonId,
        },
        select: {
          id: true,
          registration_start: true,
          registration_end: true,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      const now = new Date();

      if (
        now < hackathon.registration_start ||
        now > hackathon.registration_end
      ) {
        return {
          success: false,
          error: {
            code: "REGISTRATION_CLOSED",
            message: "Team creation is not currently allowed",
          },
        };
      }

      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id: hackathonId,
          },
        },
        select: {
          id: true,
          team_id: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      if (participant.team_id) {
        return {
          success: false,
          error: {
            code: "ALREADY_IN_TEAM",
            message: "User is already a member of a team",
          },
        };
      }

      const inviteToken = crypto.randomBytes(32).toString("hex");

      const team = await prismaClient.$transaction(async (tx) => {
        const createdTeam = await tx.team.create({
          data: {
            hackathon_id: hackathonId,
            name,
            invite_token: inviteToken,
          },
        });

        await tx.hackathonParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            team_id: createdTeam.id,
            is_team_leader: true,
          },
        });

        return createdTeam;
      });

      return {
        success: true,
        data: team,
      };
    } catch (error) {
      console.error("createTeam ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create team",
        },
      };
    }
  },
  joinRequest: async (
    team_id: string,
    hackathon_id: string,
    user_id: string,
  ) => {
    try {
      const now = new Date();

      // Check hackathon and registration period
      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathon_id,
        },
        select: {
          id: true,
          registration_start: true,
          registration_end: true,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      if (
        now < hackathon.registration_start ||
        now > hackathon.registration_end
      ) {
        return {
          success: false,
          error: {
            code: "REGISTRATION_CLOSED",
            message: "Team joining is not currently allowed",
          },
        };
      }

      // Check participant
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        select: {
          id: true,
          team_id: true,
          is_team_leader: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      if (participant.is_team_leader) {
        return {
          success: false,
          error: {
            code: "TEAM_LEADER_CANNOT_SWITCH",
            message: "Team leader cannot switch to another team",
          },
        };
      }

      // Check target team belongs to this hackathon
      const team = await prismaClient.team.findFirst({
        where: {
          id: team_id,
          hackathon_id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!team) {
        return {
          success: false,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "Team not found in this hackathon",
          },
        };
      }

      // Already a member of this team
      if (participant.team_id === team_id) {
        return {
          success: false,
          error: {
            code: "ALREADY_IN_TEAM",
            message: "User is already a member of this team",
          },
        };
      }

      // Don't allow multiple pending requests for this hackathon
      const existingRequest = await prismaClient.teamJoinRequest.findFirst({
        where: {
          user_id,
          team: {
            hackathon_id,
          },
        },
        select: {
          id: true,
          team_id: true,
        },
      });

      if (existingRequest) {
        return {
          success: false,
          error: {
            code: "REQUEST_ALREADY_EXISTS",
            message: "You already have a pending team join request",
          },
        };
      }

      const request = await prismaClient.teamJoinRequest.create({
        data: {
          user_id,
          team_id,
        },
        select: {
          id: true,
          team_id: true,
          user_id: true,
          created_at: true,
        },
      });

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      console.error("joinRequest ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create team join request",
        },
      };
    }
  },
  viewTeamDetails: async (
    team_id: string,
    hackathon_id: string,
    user_id: string,
  ) => {
    try {
      // 1. Check that the user is a participant of this hackathon
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        select: {
          id: true,
          team_id: true,
          is_team_leader: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      // 2. Check that the team belongs to this hackathon
      const team = await prismaClient.team.findFirst({
        where: {
          id: team_id,
          hackathon_id,
        },
        select: {
          id: true,
          name: true,
          invite_token: true,
          created_at: true,
          updated_at: true,

          participants: {
            select: {
              id: true,
              user_id: true,
              is_team_leader: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          teamJoinRequests: {
            select: {
              id: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!team) {
        return {
          success: false,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "Team not found",
          },
        };
      }

      // 3. Check whether current user belongs to this team
      const isTeamMember = participant.team_id === team_id;

      // 4. Only the team leader gets pending requests
      const isTeamLeader = isTeamMember && participant.is_team_leader;

      return {
        success: true,
        data: {
          id: team.id,
          name: team.name,
          invite_token: isTeamMember ? team.invite_token : null,
          created_at: team.created_at,
          updated_at: team.updated_at,
          participants: team.participants,
          pendingRequests: isTeamLeader ? team.teamJoinRequests : [],
        },
      };
    } catch (error) {
      console.error("viewTeamDetails ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch team details",
        },
      };
    }
  },
  acceptParticipant: async (
    team_id: string,
    participant_id: string,
    user_id: string,
    hackathon_id: string,
  ) => {
    try {
      // Verify that the current user is the leader of this team
      const leader = await prismaClient.hackathonParticipant.findFirst({
        where: {
          user_id,
          hackathon_id,
          team_id,
          is_team_leader: true,
        },
      });

      if (!leader) {
        return {
          success: false,
          error: {
            code: "NOT_TEAM_LEADER",
            message: "Only the team leader can accept participants",
          },
        };
      }

      const team = await prismaClient.team.findFirst({
        where: {
          id: team_id,
          hackathon_id,
        },
        select: {
          participants: {
            select: { id: true },
          },
          hackathon: {
            select: {
              max_team_size: true,
            },
          },
        },
      });

      if (!team) {
        return {
          success: false,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "Team not found",
          },
        };
      }

      const currentSize = team.participants.length;

      if (currentSize >= team.hackathon.max_team_size) {
        return {
          success: false,
          error: {
            code: "TEAM_FULL",
            message: `This team has reached its maximum size of ${team.hackathon.max_team_size} members.`,
          },
        };
      }

      // Verify that the participant has a request for this team
      const request = await prismaClient.teamJoinRequest.findUnique({
        where: {
          team_id_user_id: {
            team_id,
            user_id: participant_id,
          },
        },
      });

      if (!request) {
        return {
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Join request not found",
          },
        };
      }

      await prismaClient.$transaction(async (tx) => {
        // Add participant to this team
        await tx.hackathonParticipant.update({
          where: {
            user_id_hackathon_id: {
              user_id: participant_id,
              hackathon_id,
            },
          },
          data: {
            team_id,
            is_team_leader: false,
          },
        });

        // Remove the join request
        await tx.teamJoinRequest.delete({
          where: {
            team_id_user_id: {
              team_id,
              user_id: participant_id,
            },
          },
        });
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error("acceptParticipant ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to accept participant",
        },
      };
    }
  },

  rejectParticipant: async (
    team_id: string,
    participant_id: string,
    user_id: string,
    hackathon_id: string,
  ) => {
    if (participant_id === user_id) {
      return {
        success: false,
        error: {
          code: "CANNOT_REJECT_SELF",
          message: "You cannot reject your own join request",
        },
      };
    }
    try {
      // Verify that the current user is the leader of this team
      const leader = await prismaClient.hackathonParticipant.findFirst({
        where: {
          user_id,
          hackathon_id,
          team_id,
          is_team_leader: true,
        },
      });

      if (!leader) {
        return {
          success: false,
          error: {
            code: "NOT_TEAM_LEADER",
            message: "Only the team leader can reject participants",
          },
        };
      }

      // Verify that the participant has a request for this team
      const request = await prismaClient.teamJoinRequest.findUnique({
        where: {
          team_id_user_id: {
            team_id,
            user_id: participant_id,
          },
        },
      });

      if (!request) {
        return {
          success: false,
          error: {
            code: "REQUEST_NOT_FOUND",
            message: "Join request not found",
          },
        };
      }

      // Rejecting only removes the request.
      // The participant's current team_id remains unchanged.
      await prismaClient.teamJoinRequest.delete({
        where: {
          team_id_user_id: {
            team_id,
            user_id: participant_id,
          },
        },
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error("rejectParticipant ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reject participant",
        },
      };
    }
  },
  joinViaLink: async (
    invite_token: string,
    hackathon_id: string,
    user_id: string,
  ) => {
    try {
      // Verify hackathon and registration window
      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathon_id,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      const now = new Date();

      if (
        now < hackathon.registration_start ||
        now > hackathon.registration_end
      ) {
        return {
          success: false,
          error: {
            code: "REGISTRATION_CLOSED",
            message: "Team joining is currently closed",
          },
        };
      }

      // Verify user is participating in the hackathon
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      // Find the team using the invite token
      const team = await prismaClient.team.findFirst({
        where: {
          invite_token,
          hackathon_id,
        },
      });

      if (!team) {
        return {
          success: false,
          error: {
            code: "INVALID_INVITE",
            message: "Invalid team invite link",
          },
        };
      }

      // Already a member of this team
      if (participant.team_id === team.id) {
        return {
          success: false,
          error: {
            code: "ALREADY_TEAM_MEMBER",
            message: "You are already a member of this team",
          },
        };
      }

      // Leader cannot switch teams
      if (participant.is_team_leader) {
        return {
          success: false,
          error: {
            code: "LEADER_CANNOT_SWITCH",
            message: "Team leaders cannot switch teams",
          },
        };
      }

      // Check whether a request already exists
      const existingRequest = await prismaClient.teamJoinRequest.findUnique({
        where: {
          team_id_user_id: {
            team_id: team.id,
            user_id,
          },
        },
      });

      if (existingRequest) {
        return {
          success: false,
          error: {
            code: "REQUEST_ALREADY_EXISTS",
            message: "You already have a pending request for this team",
          },
        };
      }

      // Create join request
      const request = await prismaClient.teamJoinRequest.create({
        data: {
          team_id: team.id,
          user_id,
        },
      });

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      console.error("joinViaLink ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to join team via invite link",
        },
      };
    }
  },
  getHackathonDetails: async (hackathon_id: string, user_id?: string) => {
    try {
      const hackathon = await prismaClient.hackathon.findUnique({
        where: { id: hackathon_id },
        select: {
          id: true,
          title: true,
          description: true,
          // problem_statement: true, // uncomment after adding it to the schema
          phase: true,
          organizer_id: true, // used below to compute the viewer's role, stripped from the response
          registration_start: true,
          registration_end: true,
          submission_deadline: true,
          judging_start: true,
          judging_end: true,
          tracks: {
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          },
          // prizes: {                 // uncomment after adding the Prize model
          //   select: { id: true, title: true, description: true, amount_usd: true, position: true, track_id: true },
          //   orderBy: { position: "asc" },
          // },
          _count: { select: { participants: true, teams: true } },
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      const now = new Date();

      const registration_open =
        now >= hackathon.registration_start && now < hackathon.registration_end;

      const submission_not_yet_open = now < hackathon.registration_end;

      const submission_open =
        now >= hackathon.registration_end &&
        now < hackathon.submission_deadline;

      const submission_closed = now >= hackathon.submission_deadline;

      const { organizer_id, ...publicHackathon } = hackathon;

      // Visitor: public information only
      if (!user_id) {
        return {
          success: true,
          data: {
            hackathon: publicHackathon,
            registration_open,
            submission_open,
            submission_not_yet_open,
            submission_closed,
            viewer_role: null,
            judge_status: null,
            participation: null,
            team: null,
            project: null,
            pending_join_request: null,
          },
        };
      }

      // Logged in: work out the user's relationship to this hackathon
      const [participant, judge, pendingRequest] = await Promise.all([
        prismaClient.hackathonParticipant.findUnique({
          where: { user_id_hackathon_id: { user_id, hackathon_id } },
          select: {
            id: true,
            is_team_leader: true,
            team: {
              select: {
                id: true,
                name: true,
                invite_token: true,
                participants: {
                  select: {
                    id: true,
                    is_team_leader: true,
                    user: { select: { id: true, name: true } },
                  },
                },
                teamJoinRequests: {
                  select: {
                    id: true,
                    created_at: true,
                    user: { select: { id: true, name: true } },
                  },
                },
                project: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    repository_url: true,
                    demo_url: true,
                    track_id: true,
                    status: true,
                    submitted_at: true,
                  },
                },
              },
            },
          },
        }),
        prismaClient.hackathonJudge.findUnique({
          where: { user_id_hackathon_id: { user_id, hackathon_id } },
          select: { status: true },
        }),
        prismaClient.teamJoinRequest.findFirst({
          where: { user_id, team: { hackathon_id } },
          select: {
            id: true,
            created_at: true,
            team: { select: { id: true, name: true } },
          },
        }),
      ]);

      // Organizer, judge and participant are mutually exclusive per hackathon
      const viewer_role =
        organizer_id === user_id
          ? "ORGANIZER"
          : judge
            ? "JUDGE"
            : participant
              ? "PARTICIPANT"
              : null;

      const team = participant?.team ?? null;
      const isLeader = !!participant?.is_team_leader;

      return {
        success: true,
        data: {
          hackathon: publicHackathon,
          registration_open,
          submission_open,
          submission_not_yet_open,
          submission_closed,
          viewer_role,
          judge_status: judge?.status ?? null,
          participation: participant
            ? { id: participant.id, is_team_leader: participant.is_team_leader }
            : null,
          team: team
            ? {
                id: team.id,
                name: team.name,
                invite_token: team.invite_token, // the viewer is a member, so they can see it
                participants: team.participants,
                // only the leader sees pending requests
                pending_requests: isLeader ? team.teamJoinRequests : [],
              }
            : null,
          project: team?.project ?? null,
          pending_join_request: participant && !team ? pendingRequest : null,
        },
      };
    } catch (error) {
      console.error("getHackathonDetails ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch hackathon details",
        },
      };
    }
  },
  getTrackList: async (user_id: string, hackathon_id: string) => {
    try {
      // Verify hackathon exists
      const hackathon = await prismaClient.hackathon.findUnique({
        where: {
          id: hackathon_id,
        },
        select: {
          id: true,
        },
      });

      if (!hackathon) {
        return {
          success: false,
          error: {
            code: "HACKATHON_NOT_FOUND",
            message: "Hackathon not found",
          },
        };
      }

      // Verify user is participating in the hackathon
      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: {
            user_id,
            hackathon_id,
          },
        },
        select: {
          id: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "User is not participating in this hackathon",
          },
        };
      }

      // Fetch tracks
      const tracks = await prismaClient.hackathonTrack.findMany({
        where: {
          hackathon_id,
        },
        orderBy: {
          created_at: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        success: true,
        data: tracks,
      };
    } catch (error) {
      console.error("getTrackList ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch hackathon tracks",
        },
      };
    }
  },
  leaderboard: async (hackathon_id: string, user_id: string) => {
    try {
      const criteria = await prismaClient.criterion.findMany({
        where: { hackathon_id },
        orderBy: { position: "asc" },
      });

      const projects = await prismaClient.project.findMany({
        where: {
          hackathon_id,
          status: "SUBMITTED",
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              participants: {
                where: {
                  user_id,
                  hackathon_id,
                },
                select: {
                  user_id: true,
                },
              },
            },
          },
          track: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            where: {
              status: "SUBMITTED",
            },
            include: {
              scores: true,
            },
          },
        },
      });

      const totalWeight = criteria.reduce(
        (sum, criterion) => sum + criterion.weight,
        0,
      );

      const rankedProjects = projects
        .map((project) => {
          const reviews = project.reviews;

          if (reviews.length === 0 || totalWeight === 0) {
            return null;
          }

          const criterionScores = criteria.map((criterion) => {
            const values = reviews.flatMap((review) =>
              review.scores
                .filter((score) => score.criterion_id === criterion.id)
                .map((score) => score.value),
            );

            const average =
              values.length > 0
                ? values.reduce((sum, value) => sum + value, 0) / values.length
                : 0;

            return {
              criterion_id: criterion.id,
              name: criterion.name,
              weight: criterion.weight,
              average: Number(average.toFixed(2)),
            };
          });

          const finalScore =
            criterionScores.reduce(
              (sum, criterion) => sum + criterion.average * criterion.weight,
              0,
            ) / totalWeight;

          return {
            project_id: project.id,
            project_title: project.title,
            team: {
              id: project.team.id,
              name: project.team.name,
            },
            track: project.track,
            review_count: reviews.length,
            criterion_scores: criterionScores,
            final_score: Number(finalScore.toFixed(2)),
            is_my_project: project.team.participants.length > 0,
          };
        })
        .filter((project) => project !== null)
        .sort((a, b) => b.final_score - a.final_score);

      // Competition ranking: 1, 2, 2, 4
      let previousScore: number | null = null;
      let currentRank = 0;

      const leaderboard = rankedProjects.map((project, index) => {
        if (project.final_score !== previousScore) {
          currentRank = index + 1;
          previousScore = project.final_score;
        }

        return {
          ...project,
          rank: currentRank,
        };
      });

      const myProject = leaderboard.find((project) => project.is_my_project);

      const otherProjects = leaderboard
        .filter((project) => !project.is_my_project)
        .map(({ is_my_project, ...project }) => project);

      const myRank = myProject
        ? (({ is_my_project, ...project }) => project)(myProject)
        : null;

      return {
        success: true,
        data: {
          my_rank: myRank,
          leaderboard: otherProjects,
        },
        message: "Leaderboard fetched successfully!",
        error: null,
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);

      return {
        success: false,
        data: null,
        message: "Failed to fetch leaderboard.",
        error: {
          code: "LEADERBOARD_FETCH_FAILED",
          message: "An error occurred while fetching the leaderboard.",
        },
      };
    }
  },
};

export default hackathonService;
