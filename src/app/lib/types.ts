import { ElevationRequestStatus, UserRole } from "../generated/prisma/enums";

export type UserReturn = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ElevationRequestList = {
  id: string;
  user_id: string;
  status: ElevationRequestStatus;
  created_at: Date;
  user: {
    name: string;
    email: string;
    phone: string;
  };
};

export type CurrentUser = {
  id: string;
  name: string;
  bio: string | null;
  phone: string;
  email: string;
  address: string | null;
  role: UserRole;
  organization: string | null;
  linkedinUrl: string | null;
  gitUrl: string | null;
  created_at: Date;
  updated_at: Date;
  is_organizer: boolean;
};

export type HackathonListItem = {
  id: string;
  title: string;
  description: string | null;
  phase: "REGISTRATION" | "SUBMISSION" | "JUDGING" | "COMPLETED";
  registration_start: string;
  registration_end: string;
  submission_deadline: string;
  judging_start: string;
  judging_end: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  tracks: {
    id: string;
    hackathon_id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
};

export type ParticipantHackathonHistoryItem = {
  id: string;
  team_id: string | null;
  hackathon: {
    id: string;
    title: string;
    description: string | null;
    registration_start: string;
    registration_end: string;
    submission_deadline: string;
    judging_start: string;
    judging_end: string;
    tracks: {
      id: string;
      name: string;
    }[];
  };
};

export type ParticipantHackathonHistory = {
  upcomingHackathons: ParticipantHackathonHistoryItem[];
  currentHackathons: ParticipantHackathonHistoryItem[];
  pastHackathons: ParticipantHackathonHistoryItem[];
};

export type TeamListData = {
  currentTeamId: string | null;
  teams: {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    participants: {
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
      };
    }[];
  }[];
};


export type TeamMember = {
  id: string;
  user_id: string;
  is_team_leader: boolean;
  user: {
    id: string;
    name: string;
  };
};

export type TeamJoinRequest = {
  id: string;
  created_at: Date;
  user: {
    id: string;
    name: string;
  };
};

export type TeamDetails = {
  id: string;
  name: string;
  invite_token: string | null;
  created_at: Date;
  updated_at: Date;
  participants: TeamMember[];
  pendingRequests: TeamJoinRequest[];
};

export type JudgeHackathon = {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  judging_start: Date | null;
  judging_end: Date | null;

  tracks: {
    id: string;
    name: string;
  }[];

  _count: {
    projects: number;
  };
};