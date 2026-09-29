import ResponseUtil from "@/app/lib/api/response";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const result = await globalService.user.LOGIN_USER(data);
  if (!result.success) {
    return ResponseUtil.error(result.error, "login failed!");
  }
  return ResponseUtil.success(result.user, "User logged in successfully");
}
