import judgeService from "./module/judgeService";

const judgeServiceMap = {
  getParticipantJudgeList: judgeService.getParticipantJudgeList,
  rejectInvitation: judgeService.rejectInvitation,
  acceptInvitation: judgeService.acceptInvitation,
  getMyJudgeHackathons: judgeService.getMyJudgeHackathons,
  getHackathonDetails: judgeService.getHackathonDetails,
  submitReview: judgeService.submitReview,
  getProjectDetails: judgeService.getProjectDetails,
  getJudgeScore : judgeService.getJudgeScore
};

export default judgeServiceMap;
