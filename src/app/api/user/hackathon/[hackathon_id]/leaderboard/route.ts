import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET(
  request: Request,
  context: { params: Promise<{ hackathon_id: string }> },
) {
  try {
    const [user, resolvedParams] = await Promise.all([
      getCurrentUser(),
      context.params,
    ]);

    if (!user) {
      return ResponseUtil.error(
        "Unauthorized",
        "Session missing or expired",
      );
    }

    const { hackathon_id } = resolvedParams;

    const response = await globalService.user.leaderboard(
      hackathon_id,
      user.id,
    );

    if (!response.success) {
      return ResponseUtil.error(
        response.error?.code ?? "LEADERBOARD_FETCH_FAILED",
        response.error?.message ?? "Failed to fetch leaderboard.",
      );
    }

    return ResponseUtil.success(
      response.data,
      "Leaderboard fetched successfully",
    );
  } catch (error) {
    console.error("Error while fetching leaderboard:", error);

    return ResponseUtil.error(
      "Internal Server Error",
      "Something went wrong.",
    );
  }
}