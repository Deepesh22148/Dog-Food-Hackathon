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

    const { hackathon_id } = resolvedParams;

    if (!user) {
      return ResponseUtil.error("Unauthorized", "Session missing or expired");
    }

    const response = await globalService.user.CREATE_TEAM(
      user.id,
      hackathon_id,
      payload.name
    );
    return ResponseUtil.success(response, "Elevation request created");
  } catch (error) {
    console.error("Error while performing the request:", error);
    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
