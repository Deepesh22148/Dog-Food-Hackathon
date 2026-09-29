import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const user = await getCurrentUser();
  if(!user || user.is_organizer == false) {
    return ResponseUtil.error("UNAUTHORIZED" , "user is not authorized to access this route")
  }

  const result = await globalService.organizer.createHackathon(user.id ,data);
  if (!result.success) {
    return ResponseUtil.error(result.error || "Error while creating hackathon!", "Registration failed");
  }
  return ResponseUtil.success(result.success, "User registered successfully");
}
