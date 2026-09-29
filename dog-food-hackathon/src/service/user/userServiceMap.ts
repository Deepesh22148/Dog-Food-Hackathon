import { elevateStatus, elevateUser } from "./modules/elevateUser";
import hackathonService from "./modules/hackathonService";
import loginUser from "./modules/loginUser";
import logoutUser from "./modules/logoutUser";
import projectService from "./modules/projectService";
import registerUser from "./modules/registerUser";

const userServiceMap = {
  REGISTER_USER: registerUser,
  LOGIN_USER: loginUser,
  ELEVATE_USER: elevateUser,
  LOGOUT_USER: logoutUser,
  ELEVATE_STATUS: elevateStatus,
  ACTIVE_HACKATHON: hackathonService.getActiveHackathons,
  PARTICIPATE_USER: hackathonService.participateHackathon,
  HACKATHON_HISTORY: hackathonService.getHackathonHistory,
  TEAM_LIST : hackathonService.getTeamList,
  CREATE_TEAM : hackathonService.createTeam,
  JOIN_TEAM : hackathonService.joinRequest,
  VIEW_TEAM : hackathonService.viewTeamDetails,
  ACCEPT_TEAM_MEMBER : hackathonService.acceptParticipant,
  REJECT_TEAM_MEMBER : hackathonService.rejectParticipant,
  JOIN_VIA_LINK : hackathonService.joinViaLink,
  getHackathonDetails : hackathonService.getHackathonDetails,
  createProject : projectService.createProject,
  getTrackList : hackathonService.getTrackList,
  getProjectDetail : projectService.getProjectDetail,
  updateProject : projectService.updateProject,
  submitProject : projectService.submitProject,
  getGallery : projectService.getGallery,
  leaderboard : hackathonService.leaderboard
};

export default userServiceMap;
