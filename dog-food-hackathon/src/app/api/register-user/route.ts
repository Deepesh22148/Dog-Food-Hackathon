import ResponseUtil from "@/app/lib/api/response";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const result = await globalService.user.REGISTER_USER(data);
  if (!result.success) {
    return ResponseUtil.error(result.error, "Registration failed");
  }
  return ResponseUtil.success(result.user, "User registered successfully");
}
