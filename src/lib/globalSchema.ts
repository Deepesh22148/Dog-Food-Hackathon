import { createHackathonSchema } from "./schema/organizer/createHackathonSchema";
import { createTeamSchema } from "./schema/team/createSchema";
import { loginSchema } from "./schema/user/loginSchema";
import { registerSchema } from "./schema/user/registerSchema";

const SCHEMA = {
  USER: {
    REGISTER: registerSchema,
    LOGIN: loginSchema,
    TEAM: createTeamSchema,
  },
  ORGANIZATION: {
    HACKATHON: {
      CREATE: createHackathonSchema,
    },
  },
};

export default SCHEMA;
