import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET() {
  // 1. Get authenticated user securely from session cookie
  const user = await getCurrentUser();

  if (!user) {
    return ResponseUtil.error("Unauthorized", "Session missing or expired");
  }

  // 2. Execute elevation using server-verified user ID
  const result = await globalService.user.ELEVATE_USER(user.id);

  if (!result.success) {
    return ResponseUtil.error(result.error.code, "Request failed");
  }

  return ResponseUtil.success(true, "Elevation request created");
}