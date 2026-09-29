import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
    }

    const result = await globalService.user.HACKATHON_HISTORY(user.id);

    if (!result.success) {
      return ResponseUtil.error(
        result.error?.code ?? "INTERNAL_ERROR",
        result.error?.message ?? "Request failed",
      );
    }

    return ResponseUtil.success(
      result.data,
      "Hackathon history fetched successfully",
    );
  } catch (error) {
    console.error("GET /api/user/hackathon/history failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching hackathon history",
    );
  }
}
