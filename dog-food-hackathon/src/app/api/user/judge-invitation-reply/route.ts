import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function POST(request: Request) {
  try {
    const [user] = await Promise.all([getCurrentUser()]);

    const payload = await request.json();

    if (!user) {
      return ResponseUtil.error("Unauthorized", "Session missing or expired");
    }
    if (!payload.hackathon_id || typeof payload.accept !== "boolean") {
      return ResponseUtil.error(
        "INVALID_REQUEST",
        "Invalid invitation response",
      );
    }

    if (payload.accept === true) {
      const response = await globalService.judge.acceptInvitation(
        payload.hackathon_id,
        user.id,
      );

      if (!response.success) {
        console.error("ACCEPTING INVITATION ::: Failed:", response.error);

        return ResponseUtil.error(
          "ACCEPT_FAILED",
          response.error ?? "Failed to accept team member",
        );
      }

      return ResponseUtil.success(
        response.data,
        "judge invitation accepted successfully",
      );
    }
    const response = await globalService.judge.rejectInvitation(
      payload.hackathon_id,
      user.id,
    );

    if (!response.success) {
      console.error("REJECT_TEAM_MEMBER ::: Failed:", response.error);

      return ResponseUtil.error(
        "REJECT_FAILED",
        response.error ?? "Failed to reject invitation",
      );
    }

    return ResponseUtil.success(
      response.data,
      "judge invitation rejected successfully",
    );
  } catch (error) {
    console.error("JUDGE_INVITATION_REPLY ::: Error:", error);

    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
