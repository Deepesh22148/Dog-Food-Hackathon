import apiClient from "../lib/api/apiClient"
import { ApiResponse } from "../lib/api/types";
import { JudgeHackathon } from "../lib/types";

interface Criterion {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  position: number;
}

interface ReviewScore {
  criterion_id: string;
  value: number;
}

interface Review {
  id: string;
  judge_id: string;
  project_id: string;
  comment?: string | null;
  status: "DRAFT" | "SUBMITTED";
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
  scores: ReviewScore[];
}

interface ProjectDetails {
  [x: string]: any;
  id: string;
  title: string;
  description: string;
  repository_url?: string | null;
  demo_url?: string | null;
  submitted_at?: string | null;

  track?: {
    id: string;
    name: string;
  } | null;

  team?: {
    id: string;
    name: string;
  } | null;

  hackathon: {
    id: string;
    title: string;
    phase: string;
    judging_start: string;
    judging_end: string;
    criteria: Criterion[];
  };

  criteria: Criterion[];
  review: Review | null;
  isSubmitted: boolean;
}
const judgeService = {
    getMyJudgeHackathon : async () : Promise<ApiResponse<JudgeHackathon[]>>=> {
        const url = `/api/judge/get-active-judge-list`;
        return apiClient.get(url);
    }, 
    getHackathonDetails : async (hackathon_id : string) : Promise<ApiResponse<any>> => {
        const url = `/api/judge/get-hackathon-detail`;
        const payload = {
            hackathon_id
        }
        return apiClient.post(url , payload);
    },
    getProjectInfo : async (project_id : string , hackathon_id : string) : Promise<ApiResponse<ProjectDetails>> => {
        const payload = {
            project_id, 
            hackathon_id
        }
        const url = `/api/judge/get-project-details`;
        return await apiClient.post(url , payload);
    },
    submitReview : async (hackathon_id : string , payload : any) => {
        const url = `/api/judge/submit-review`
        return await apiClient.post(url , payload);
    }
}

export default judgeService
