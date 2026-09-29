import elevationService from "./module/elevationService"

const adminServiceMap = {
    getElevationList : elevationService.getList,
    executeElevation : elevationService.executeElevation
}

export default adminServiceMap
