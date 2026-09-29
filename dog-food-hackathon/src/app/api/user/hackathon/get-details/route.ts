import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function POST(request: Request) {
  try {
    const [user] = await Promise.all([getCurrentUser()]);

    const payload = await request.json();

    if (!payload.hackathon_id) {
      return ResponseUtil.error(
        "INVALID_REQUEST",
        "Invalid invitation response",
      );
    }

    const response = await globalService.user.getHackathonDetails(
      payload.hackathon_id,
      user?.id,
    );

    if (!response.success) {
      console.error("GET HACKATHON DETAILS ::: Failed:", response.error);

      return ResponseUtil.error(
        response.error?.code || "FETCH ERROR",
        response.error?.message ?? "something went wrong while fetching hackathon details!",
      );
    }

    return ResponseUtil.success(
      response.data,
      "hackathon details fetched successfully",
    );
  } catch (error) {
    console.error("HACKATHON:GET_DETAILS ::: Error:", error);
    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
