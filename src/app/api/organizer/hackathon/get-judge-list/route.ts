import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const user = await getCurrentUser();

    if (!user || user.is_organizer === false) {
      return ResponseUtil.error(
        "UNAUTHORIZED",
        "User is not authorized to access this route",
      );
    }

    if (!data.hackathon_id) {
      return ResponseUtil.error(
        "INVALID_REQUEST",
        "Hackathon ID is required",
      );
    }

    const response = await globalService.organizer.getJudgeList(
      data.hackathon_id,
      user.id,
    );

    if (!response.success) {
      return ResponseUtil.error(
        response.error ?? "ERROR",
        "Failed to fetch judge list",
      );
    }

    return ResponseUtil.success(
      response.data,
      "Judge list fetched successfully",
    );
  } catch (error) {
    console.error("GET_JUDGE_LIST :: route failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong",
    );
  }
}
