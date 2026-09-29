import { ElevationRequestStatus } from "../generated/prisma/enums";
import apiClient from "../lib/api/apiClient";
import { ApiResponse } from "../lib/api/types";
import urls from "../lib/api/url";
import { ElevationRequestList } from "../lib/types";

const adminService = {
  getElevateUserList: async (): Promise<
    ApiResponse<ElevationRequestList[]>
  > => {
    const url = urls.ADMIN.ELEVATION_LIST;
    return await apiClient.get(url);
  },
  executeElevation: async (
    entry_id: string,
    action: ElevationRequestStatus,
  ) => {
    const url = urls.ADMIN.EXECUTE_ELEVATION;
    return await apiClient.post(url, {
      entry_id,
      action,
    });
  },
  logoutUser: async (): Promise<ApiResponse<void>> => {
    return await apiClient.get(urls.USER.LOGOUT_USER);
  },
};

export default adminService;
