import apiClient from "../lib/api/apiClient";
import { ApiResponse } from "../lib/api/types";
import urls from "../lib/api/url";
interface Track {
  id: string;
  name: string;
}
interface HackathonDetails {
  id: string;
  title: string;
  description: string | null;
  phase: string;

  registration_start: string;
  registration_end: string;
  submission_deadline: string;
  judging_start: string;
  judging_end: string;

  created_at: string;
  updated_at: string;

  tracks: Track[];

  _count: {
    participants: number;
    teams: number;
    judges: number;
    tracks: number;
  };
}

const organizerService = {
  createHackathon: async (payload: any) => {
    return apiClient.post(urls.ORGANIZER.HACKATHON.CREATE, payload);
  },
  getHackathonList: async () => {
    return apiClient.get(urls.ORGANIZER.HACKATHON.GETLIST);
  },
  getHackathonDetails: async (
    hackathon_id: string,
  ): Promise<ApiResponse<HackathonDetails>> => {
    const payload = {
      hackathon_id,
    };
    return apiClient.post(urls.ORGANIZER.HACKATHON.GETDETAILS, payload);
  },
  getJudgeList : async (hackathon_id : string ) : Promise<ApiResponse<any>>=> {
    const payload = {
        hackathon_id
    }
    return apiClient.post(urls.ORGANIZER.HACKATHON.JUDGELIST , payload);
  },
  inviteOrganizerList : async (judge_id : string , hackathon_id : string) => {
    const payload = {
        judge_id,
        hackathon_id
    }
    return apiClient.post(urls.ORGANIZER.HACKATHON.INVITEUSER , payload)
  },
  inviteJudge : async (judge_id : string , hackathon_id : string , tracks : string[]) => {
    const payload = {
        judge_id ,
        hackathon_id,
        tracks
    }

    return await apiClient.post(urls.ORGANIZER.HACKATHON.INVITEUSER , payload);
  }
};

export default organizerService;
