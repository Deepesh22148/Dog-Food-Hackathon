import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET() {
  // 1. Get authenticated user securely from session cookie
  const user = await getCurrentUser();

  if (!user) {
    return ResponseUtil.error("Unauthorized", "Session missing or expired");
  }

  return ResponseUtil.success(user, "Elevation request created");
}