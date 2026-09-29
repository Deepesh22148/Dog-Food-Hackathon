import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
    }

    const result = await globalService.judge.getParticipantJudgeList(user.id);
    if (!result.success) {
      return ResponseUtil.error(
        result.error ?? "INTERNAL_ERROR",
        "Failed to fetch judge invitations",
      );
    }
    return ResponseUtil.success(
      result.data,
      "Judge invitations fetched successfully",
    );
  } catch (error) {
    console.error("GET /api/judge/invitations failed:", error);
    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching judge invitations",
    );
  }
}
