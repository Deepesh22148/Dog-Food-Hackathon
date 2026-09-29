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
      return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
    }

    const result = await globalService.user.getTrackList(user.id , resolvedParams.hackathon_id);

    if (!result.success) {
      return ResponseUtil.error(
        result.error?.code ?? "INTERNAL_ERROR",
        result.error?.message ?? "Request failed",
      );
    }

    return ResponseUtil.success(
      result.data,
      "Track List fetched successfully",
    );
  } catch (error) {
    console.error("GET /api/user/hackathon/get-tracks failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching track list",
    );
  }
}
