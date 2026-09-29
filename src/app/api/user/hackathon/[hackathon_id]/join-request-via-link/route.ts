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

    const response = await globalService.user.JOIN_VIA_LINK(
      payload.invite_token,
      hackathon_id,
      user.id,
    );
    return ResponseUtil.success(
      response,
      "Team join request created successfully",
    );
  } catch (error) {
    console.error("Error while performing the request:", error);
    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
