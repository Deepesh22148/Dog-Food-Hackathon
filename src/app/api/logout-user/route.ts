import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {

  const result = await globalService.user.LOGOUT_USER();

  if (!result.success) {
    return ResponseUtil.error("FAIL", "Request failed");
  }

  return ResponseUtil.success(true, "Logout out successful");
}
