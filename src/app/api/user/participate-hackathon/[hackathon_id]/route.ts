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

    const { hackathon_id } = resolvedParams;

    if (!user) {
      return ResponseUtil.error("Unauthorized", "Session missing or expired");
    }

    const response = await globalService.user.PARTICIPATE_USER(
      user.id,
      hackathon_id,
    );
    return ResponseUtil.success(response, "Elevation request created");
  } catch (error) {
    console.error("Error while performing the request:", error);
    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
