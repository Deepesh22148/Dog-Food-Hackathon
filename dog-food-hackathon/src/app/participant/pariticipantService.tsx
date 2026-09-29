import apiClient from "../lib/api/apiClient";
import urls from "../lib/api/url";
import { ApiResponse } from "../lib/api/types";
import { ElevateResult } from "@/service/user/modules/elevateUser";
import { CurrentUser, HackathonListItem, ParticipantHackathonHistory } from "../lib/types";

type HackathonHistory = {
  upcomingHackathons: HackathonListItem[];
  currentHackathons: HackathonListItem[];
  pastHackathons: HackathonListItem[];
};
const pariticipantService = {
  elevateRole: async (): Promise<ApiResponse<ElevateResult>> => {
    return await apiClient.get(urls.USER.ELEVATE_USER);
  },
  logoutUser: async (): Promise<ApiResponse<void>> => {
    return await apiClient.get(urls.USER.LOGOUT_USER);
  },
  aboutMe: async (): Promise<ApiResponse<CurrentUser | null>> => {
    return await apiClient.get(urls.USER.ABOUT_ME);
  },
  getActiveHackathonList: async () => {
    return await apiClient.get(urls.USER.ACTIVE_HACKATHON);
  },
  participateHackathon: async (hackathon_id: string) => {
    const url = `${urls.USER.PARTICIPATE_HACKATHON}/${hackathon_id}`;
    return await apiClient.get(url);
  },
  getHackathonHistory: async (): Promise<ApiResponse<ParticipantHackathonHistory>> => {
    return await apiClient.get(urls.USER.HACKATHON_HISTORY);
  },
  getJudgeList : async () : Promise<ApiResponse<any>>=> {
    const url = `/api/user/judge-list`;
    return await apiClient.get(url);
  },
  respondToJudgeInvite : async (hackathon_id : string , accept : boolean) => {
    const url = `/api/user/judge-invitation-reply`
    const payload = {
      hackathon_id , accept
    }
    return await apiClient.post(url , payload);
  },

};

export default pariticipantService;
