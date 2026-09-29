import React from "react";

const urls = {
  TEST: {
    GETDATA: "/api/health",
    POSTTEST: "/api/post-test",
  },
  USER: {
    REGISTER: "/api/register-user",
    LOGIN: "/api/login-user",
    ELEVATE_USER: "/api/elevate-user",
    LOGOUT_USER: "/api/logout-user",
    ABOUT_ME: "/api/user/me",
    ELEVATE_STATUS: "/api/user/get-elevation-status",
    ACTIVE_HACKATHON : "/api/user/get-active-hackathon",
    PARTICIPATE_HACKATHON : "/api/user/participate-hackathon",
    HACKATHON_HISTORY : "/api/user/hackathon-history",
    GETTEAMLIST : "/api/user/hackathon/get-team-list"
  },
  ADMIN: {
    ELEVATION_LIST: "/api/admin/get-elevation-list",
    EXECUTE_ELEVATION: "/api/admin/elevation/execute",
  },
  ORGANIZER: {
    HACKATHON: {
      CREATE: "/api/organizer/hackathon/create",
      GETLIST : "/api/organizer/hackathon/get-all-hackathons",
      GETDETAILS : "/api/organizer/hackathon/get-hackathon-details",
      JUDGELIST : "/api/organizer/hackathon/get-judge-list",
      INVITEUSER : "/api/organizer/hackathon/invite-judge"
    },
  },
};

export default urls;
