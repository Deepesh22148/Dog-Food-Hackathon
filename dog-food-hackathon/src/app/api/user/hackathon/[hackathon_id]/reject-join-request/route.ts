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

    const response = await globalService.user.REJECT_TEAM_MEMBER(
      payload.team_id,
      payload.participant_id,
      user.id,
      hackathon_id,
    );

    if (!response.success) {
      console.error("ACCEPT_TEAM_MEMBER ::: Failed:", response.error);

      return ResponseUtil.error(
        response.error?.code ?? "ACCEPT_FAILED",
        response.error?.message ?? "Failed to accept team member",
      );
    }

    console.log(
      "ACCEPT_TEAM_MEMBER ::: Participant accepted:",
      payload.participant_id,
    );

    return ResponseUtil.success(
      response.data,
      "Team member accepted successfully",
    );
  } catch (error) {
    console.error("ACCEPT_TEAM_MEMBER ::: Error:", error);

    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
