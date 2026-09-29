// import taskServiceMap from "./task/taskServiceMap"

import adminServiceMap from "./admin/adminServiceMap"
import judgeServiceMap from "./judge/judgeServiceMap";
import organizerServiceMap from "./organizer/organizerServiceMap"
import userServiceMap from "./user/userServiceMap"

const globalService = {
    // task : {
    //     ...taskServiceMap
    // },
    user : {
        ...userServiceMap
    },
    admin : {
        ...adminServiceMap
    },
    organizer : {
        ...organizerServiceMap
    },
    judge : {
        ...judgeServiceMap
    }
}

export default globalService;
