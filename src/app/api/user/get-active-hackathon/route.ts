import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function GET() {
  try {

    const user = await getCurrentUser();
    
    const result = await globalService.user.ACTIVE_HACKATHON(user?.id);

    if (!result.success) {
      return ResponseUtil.error(
        result?.error?.code || "INTERNAL_ERROR",
        result?.error?.message ||
          "Something went wrong while fetching active hackathons",
      );
    }

    return ResponseUtil.success(
      result.data,
      "Active hackathons fetched successfully",
    );
  } catch (error) {
    console.error("GET /api/user/hackathon/active failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching active hackathons",
    );
  }
}
