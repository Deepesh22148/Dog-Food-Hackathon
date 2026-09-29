import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.is_organizer) {
      return ResponseUtil.error(
        "UNAUTHORIZED",
        "User is not authorized to access this route"
      );
    }

    const result = await globalService.organizer.getAllHackathons(user.id);

    if (!result.success) {
      return ResponseUtil.error(
        "INTERNAL_ERROR",
        "Failed to fetch hackathons"
      );
    }

    return ResponseUtil.success(
      result.data,
      "Hackathons fetched successfully"
    );
  } catch (error) {
    console.error("something went wrong while fetching hackathons details!", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while fetching hackathons"
    );
  }
}
