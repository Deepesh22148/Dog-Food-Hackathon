import prismaClient from "@/app/lib/prisma/prismaClient";
import { Prisma } from "@/app/generated/prisma/client";
import {
  projectSchema,
  type ProjectFormValues,
} from "@/lib/schema/project/projectSchema";

type CreateProjectPayload = ProjectFormValues & { hackathon_id: string };
type UpdateProjectPayload = ProjectFormValues & { project_id: string };

const projectService = {
  createProject: async (user_id: string, payload: CreateProjectPayload) => {
    try {
      const { hackathon_id } = payload;

      // The client validates too, but the backend never trusts it
      const parsed = projectSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid project data",
          },
        };
      }

      const data = {
        title: parsed.data.title,
        description: parsed.data.description,
        repository_url: parsed.data.repository_url || null,
        demo_url: parsed.data.demo_url || null,
        track_id: parsed.data.track_id || null,
      };

      const participant = await prismaClient.hackathonParticipant.findUnique({
        where: {
          user_id_hackathon_id: { user_id, hackathon_id },
        },
        select: {
          is_team_leader: true,
          team: {
            select: {
              id: true,
              hackathon: {
                select: { id: true, submission_deadline: true },
              },
              project: { select: { id: true } },
            },
          },
        },
      });

      if (!participant) {
        return {
          success: false,
          error: {
            code: "NOT_PARTICIPATING",
            message: "You are not participating in this hackathon",
          },
        };
      }

      if (!participant.team) {
        return {
          success: false,
          error: {
            code: "NO_TEAM",
            message: "You must be in a team to create a project",
          },
        };
      }

      if (!participant.is_team_leader) {
        return {
          success: false,
          error: {
            code: "NOT_TEAM_LEADER",
            message: "Only the team leader can create the project",
          },
        };
      }

      const { team } = participant;

      // Timestamp is the authority, not Hackathon.phase
      if (new Date() >= team.hackathon.submission_deadline) {
        return {
          success: false,
          error: {
            code: "SUBMISSION_CLOSED",
            message: "The submission deadline has passed",
          },
        };
      }

      if (team.project) {
        return {
          success: false,
          error: {
            code: "PROJECT_ALREADY_EXISTS",
            message: "Your team already has a project",
          },
        };
      }

      // Prisma can't check that a track belongs to the same hackathon as the team
      if (data.track_id) {
        const track = await prismaClient.hackathonTrack.findFirst({
          where: { id: data.track_id, hackathon_id: team.hackathon.id },
          select: { id: true },
        });

        if (!track) {
          return {
            success: false,
            error: {
              code: "INVALID_TRACK",
              message: "Track does not belong to this hackathon",
            },
          };
        }
      }

      const project = await prismaClient.project.create({
        data: {
          ...data,
          hackathon_id: team.hackathon.id, // taken from the team, not the payload
          team_id: team.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          repository_url: true,
          demo_url: true,
          track_id: true,
          status: true,
          submitted_at: true,
          created_at: true,
        },
      });

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      // Two fast clicks can both pass the "already exists" check.
      // team_id @unique catches the second one.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: {
            code: "PROJECT_ALREADY_EXISTS",
            message: "Your team already has a project",
          },
        };
      }

      console.error("createProject ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create project",
        },
      };
    }
  },
  getProjectDetail: async (
    user_id: string,
    hackathon_id: string,
    project_id: string,
  ) => {
    try {
      const project = await prismaClient.project.findFirst({
        where: {
          id: project_id,
          hackathon_id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          repository_url: true,
          demo_url: true,
          track_id: true,
          status: true,
        },
      });

      if (!project) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        };
      }

      const data = {
        id: project.id,
        title: project.title,
        description: project.description,
        repository_url: project.repository_url ?? null,
        demo_url: project.demo_url ?? null,
        track_id: project.track_id ?? null,
        status: project.status as "DRAFT" | "SUBMITTED",
      };

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("getProjectDetail ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch project details",
        },
      };
    }
  },
  updateProject: async (user_id: string, payload: UpdateProjectPayload) => {
    try {
      const { project_id } = payload;

      const parsed = projectSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid project data",
          },
        };
      }

      const data = {
        title: parsed.data.title,
        description: parsed.data.description,
        repository_url: parsed.data.repository_url || null,
        demo_url: parsed.data.demo_url || null,
        track_id: parsed.data.track_id || null,
      };

      // Project -> team -> hackathon, plus the caller's own membership row in that team
      const project = await prismaClient.project.findUnique({
        where: { id: project_id },
        select: {
          id: true,
          status: true,
          team: {
            select: {
              hackathon: {
                select: {
                  id: true,
                  registration_end: true,
                  submission_deadline: true,
                  _count: { select: { tracks: true } },
                },
              },
              participants: {
                where: { user_id },
                select: { is_team_leader: true },
              },
            },
          },
        },
      });

      const membership = project?.team.participants[0];

      // Same answer for "doesn't exist" and "not on this team", so ids can't be probed
      if (!project || !membership) {
        return {
          success: false,
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
        };
      }

      if (!membership.is_team_leader) {
        return {
          success: false,
          error: {
            code: "NOT_TEAM_LEADER",
            message: "Only the team leader can edit the project",
          },
        };
      }

      const { hackathon } = project.team;
      const now = new Date();

      if (now < hackathon.registration_end) {
        return {
          success: false,
          error: {
            code: "SUBMISSION_NOT_OPEN",
            message: "Submissions open after registration closes",
          },
        };
      }

      if (now >= hackathon.submission_deadline) {
        return {
          success: false,
          error: {
            code: "SUBMISSION_CLOSED",
            message: "The submission deadline has passed",
          },
        };
      }

      // A submitted project must stay complete, so it can't lose its track
      if (
        project.status === "SUBMITTED" &&
        hackathon._count.tracks > 0 &&
        !data.track_id
      ) {
        return {
          success: false,
          error: {
            code: "TRACK_REQUIRED",
            message: "A submitted project must have a track",
          },
        };
      }

      if (data.track_id) {
        const track = await prismaClient.hackathonTrack.findFirst({
          where: { id: data.track_id, hackathon_id: hackathon.id },
          select: { id: true },
        });

        if (!track) {
          return {
            success: false,
            error: {
              code: "INVALID_TRACK",
              message: "Track does not belong to this hackathon",
            },
          };
        }
      }

      const updated = await prismaClient.project.update({
        where: { id: project.id },
        data, // status and submitted_at are never touched here
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
      });

      return { success: true, data: updated };
    } catch (error) {
      console.error("updateProject ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update project",
        },
      };
    }
  },
  submitProject: async (
    user_id: string,
    hackathon_id: string,
    project_id: string,
  ) => {
    try {
      // hackathon_id only scopes the lookup; ownership comes from the team membership
      const project = await prismaClient.project.findFirst({
        where: { id: project_id, hackathon_id },
        select: {
          id: true,
          title: true,
          description: true,
          track_id: true,
          repository_url : true,
          team: {
            select: {
              hackathon: {
                select: {
                  id: true,
                  registration_end: true,
                  submission_deadline: true,
                  _count: { select: { tracks: true } },
                },
              },
              participants: {
                where: { user_id },
                select: { is_team_leader: true },
              },
            },
          },
        },
      });

      const membership = project?.team.participants[0];

      // Same answer for "doesn't exist" and "not on this team", so ids can't be probed
      if (!project || !membership) {
        return {
          success: false,
          error: { code: "PROJECT_NOT_FOUND", message: "Project not found" },
        };
      }

      if (!membership.is_team_leader) {
        return {
          success: false,
          error: {
            code: "NOT_TEAM_LEADER",
            message: "Only the team leader can submit the project",
          },
        };
      }

      const { hackathon } = project.team;
      const now = new Date();

      if (now < hackathon.registration_end) {
        return {
          success: false,
          error: {
            code: "SUBMISSION_NOT_OPEN",
            message: "Submissions open after registration closes",
          },
        };
      }

      if (now >= hackathon.submission_deadline) {
        return {
          success: false,
          error: {
            code: "SUBMISSION_CLOSED",
            message: "The submission deadline has passed",
          },
        };
      }

      // Required at submit time only, so drafts can stay incomplete
      if (!project.title.trim() || !project.description.trim()) {
        return {
          success: false,
          error: {
            code: "INCOMPLETE_PROJECT",
            message: "Title and description are required to submit",
          },
        };
      }

      if (hackathon._count.tracks > 0 && !project.track_id) {
        return {
          success: false,
          error: {
            code: "TRACK_REQUIRED",
            message: "Select a track before submitting",
          },
        };
      }

      const repositoryUrl = project.repository_url?.trim();

      if (repositoryUrl) {
        const duplicate = await prismaClient.project.findFirst({
          where: {
            hackathon_id,
            repository_url: repositoryUrl,
            status: "SUBMITTED",
            id: { not: project.id },
          },
          select: {
            id: true,
          },
        });

        if (duplicate) {
          return {
            success: false,
            error: {
              code: "DUPLICATE_REPOSITORY_URL",
              message:
                "This repository URL has already been submitted by another team in this hackathon.",
            },
          };
        }
      }
      const submitted = await prismaClient.project.update({
        where: { id: project.id },
        data: {
          status: "SUBMITTED",
          submitted_at: now, // overwritten on every resubmit = time of the latest submission
        },
        select: {
          id: true,
          title: true,
          status: true,
          submitted_at: true,
        },
      });

      return { success: true, data: submitted };
    } catch (error) {
      console.error("submitProject ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit project",
        },
      };
    }
  },
  getGallery: async (filters: {
    q?: string;
    hackathon_id?: string;
    track_id?: string;
    page?: number;
  }) => {
    try {
      const PAGE_SIZE = 50; // large enough that every fixture project lands on page one
      const page = Math.max(1, Number(filters.page) || 1);
      const q = filters.q?.trim();

      const where: Prisma.ProjectWhereInput = {
        status: "SUBMITTED", // drafts are never public
        ...(filters.hackathon_id && { hackathon_id: filters.hackathon_id }),
        ...(filters.track_id && { track_id: filters.track_id }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { team: { name: { contains: q, mode: "insensitive" } } },
          ],
        }),
      };

      const [projects, total, hackathons, tracks] = await Promise.all([
        prismaClient.project.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            repository_url: true,
            demo_url: true,
            submitted_at: true,
            team: { select: { id: true, name: true } },
            track: { select: { id: true, name: true } },
            hackathon: { select: { id: true, title: true } },
          },
          orderBy: [{ submitted_at: "desc" }, { id: "asc" }], // id keeps paging stable
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prismaClient.project.count({ where }),
        // options for the hackathon dropdown: only events that have submissions
        prismaClient.hackathon.findMany({
          where: { projects: { some: { status: "SUBMITTED" } } },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        }),
        // tracks only make sense inside one hackathon
        filters.hackathon_id
          ? prismaClient.hackathonTrack.findMany({
              where: { hackathon_id: filters.hackathon_id },
              select: { id: true, name: true },
              orderBy: { name: "asc" },
            })
          : Promise.resolve([]),
      ]);

      return {
        success: true,
        data: {
          projects: projects.map((p) => ({
            ...p,
            description:
              p.description.length > 300
                ? `${p.description.slice(0, 300)}...`
                : p.description,
          })),
          pagination: {
            page,
            page_size: PAGE_SIZE,
            total,
            total_pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
          },
          filters: { hackathons, tracks },
        },
      };
    } catch (error) {
      console.error("getGallery ::: Error:", error);

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch gallery",
        },
      };
    }
  },
};

export default projectService;
