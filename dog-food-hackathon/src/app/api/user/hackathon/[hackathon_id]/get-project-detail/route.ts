import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function POST(
  request: Request,
  context: { params: Promise<{ hackathon_id: string }> },
) {
  try {
    const [user, resolvedParams] = await Promise.all([
      getCurrentUser(),
      context.params,
    ]);

    const payload = await request.json();

    if (!user) {
      return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
    }

    const result = await globalService.user.getProjectDetail(user.id , resolvedParams.hackathon_id , payload.project_id);

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
    console.error("GET /api/user/hackathon/get-project-detail failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching track list",
    );
  }
}
