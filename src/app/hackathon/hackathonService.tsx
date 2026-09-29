import React from "react";
import apiClient from "../lib/api/apiClient";
import urls from "../lib/api/url";
import { TeamDetails, TeamListData } from "../lib/types";
import { ApiResponse } from "../lib/api/types";

type createPayloadType = {
  name: string;
};

interface CriterionScore {
  criterion_id: string;
  name: string;
  weight: number;
  average: number;
}

interface LeaderboardProject {
  project_id: string;
  project_title: string;
  team: {
    id: string;
    name: string;
  };
  track: {
    id: string;
    name: string;
  } | null;
  review_count: number;
  criterion_scores: CriterionScore[];
  final_score: number;
  rank: number;
}

interface LeaderboardDetails {
  my_rank: LeaderboardProject | null;
  leaderboard: LeaderboardProject[];
}

type responseType = {
  data: TeamDetails;
};
interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  repository_url: string | null;
  demo_url: string | null;
  track_id: string | null;
  status: "DRAFT" | "SUBMITTED";
}
const hackathonService = {
  getTeamList: async (
    hackathon_id: string,
  ): Promise<ApiResponse<TeamListData>> => {
    const url = `/api/user/hackathon/${hackathon_id}/get-team-list`;
    return apiClient.get(url);
  },
  createTeam: async (hackathon_id: string, payload: createPayloadType) => {
    const url = `/api/user/hackathon/${hackathon_id}/create-team`;
    return apiClient.post(url, payload);
  },
  joinTeam: async (hackathon_id: string, team_id: string) => {
    const url = `/api/user/hackathon/${hackathon_id}/join-team`;
    const payload = {
      team_id,
    };
    return apiClient.post(url, payload);
  },
  viewTeam: async (
    hackathon_id: string,
    team_id: string,
  ): Promise<ApiResponse<any>> => {
    const url = `/api/user/hackathon/${hackathon_id}/view-team`;
    const payload = {
      team_id,
    };
    return apiClient.post(url, payload);
  },
  acceptMember: async (
    hackathon_id: string,
    team_id: string,
    participant_id: string,
  ) => {
    const url = `/api/user/hackathon/${hackathon_id}/accept-join-request`;
    const payload = {
      team_id,
      participant_id,
    };
    return apiClient.post(url, payload);
  },
  rejectMember: async (
    hackathon_id: string,
    team_id: string,
    participant_id: string,
  ) => {
    const url = `/api/user/hackathon/${hackathon_id}/reject-join-request`;
    const payload = {
      team_id,
      participant_id,
    };
    return apiClient.post(url, payload);
  },
  joinTeamViaLink: async (hackathon_id: string, invite_token: string) => {
    const payload = {
      hackathon_id,
      invite_token,
    };
    const url = `/api/user/hackathon/${hackathon_id}/join-request-via-link`;
    return apiClient.post(url, payload);
  },
  aboutMe: async () => {
    const url = "/api/user/me";
    return apiClient.get(url);
  },
  getHackathonDetail: async (
    hackathon_id: string,
  ): Promise<ApiResponse<any>> => {
    const url = "/api/user/hackathon/get-details";
    const payload = {
      hackathon_id,
    };
    return await apiClient.post(url, payload);
  },
  participateHackathon: async (hackathon_id: string) => {
    const url = `${urls.USER.PARTICIPATE_HACKATHON}/${hackathon_id}`;
    return await apiClient.get(url);
  },
  createDraft: async (hackathon_id: string, payload: any) => {
    const updatedPayload = {
      hackathon_id,
      ...payload,
    };
    const url = "/api/user/create-project";
    return apiClient.post(url, updatedPayload);
  },
  editDraft: async (project_id: string, payload: any) => {
    const updatedPayload = {
      project_id,
      ...payload,
    };
    const url = "/api/user/update-project";
    return apiClient.post(url, updatedPayload);
  },
  getTracks: async (hackathon_id: string): Promise<ApiResponse<any>> => {
    const url = `/api/user/hackathon/${hackathon_id}/get-tracks`;
    return await apiClient.get(url);
  },
  getProjectDetail: async (
    hackathon_id: string,
    project_id: string,
  ): Promise<ApiResponse<ProjectRecord>> => {
    const url = `/api/user/hackathon/${hackathon_id}/get-project-detail`;
    const payload = {
      project_id,
    };
    return await apiClient.post(url, payload);
  },
  submitProject: async (
    project_id: string,
    hackathon_id: string,
  ): Promise<ApiResponse<any>> => {
    const url = `/api/user/hackathon/${hackathon_id}/submit-project`;
    const payload = {
      project_id,
    };
    return apiClient.post(url, payload);
  },
  getLeaderboard: async (hackathon_id: string) : Promise<ApiResponse<LeaderboardDetails>> => {
    return await apiClient.get(
      `/api/user/hackathons/${hackathon_id}/leaderboard`,
    );
  },
};

export default hackathonService;
