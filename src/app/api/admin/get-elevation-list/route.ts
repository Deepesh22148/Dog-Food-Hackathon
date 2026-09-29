import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return ResponseUtil.error(
      "UNAUTHORIZED",
      "user is not authorised to access this route!",
    );
  }

  const result = await globalService.admin.getElevationList();

  return ResponseUtil.success(result, "Elevation List Fetched Successfully!");
}
