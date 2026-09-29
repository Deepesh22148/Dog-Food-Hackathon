import hackathonService from './module/hackathonService'

const organizerServiceMap = {
    createHackathon : hackathonService.create,
    getAllHackathons : hackathonService.getAllHackathons,
    getHackathonDetails : hackathonService.getHackathonDetails,
    getJudgeList : hackathonService.getJudgeList,
    sentInvitation : hackathonService.sendInvitation,
    // (
    //   data.hackathon_id,
    //   data.judge_id,
    //   user.id,
    // );
}

export default organizerServiceMap
