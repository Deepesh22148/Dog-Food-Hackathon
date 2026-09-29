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

    const response = await globalService.organizer.getHackathonDetails(
      data.hackathon_id,
      user.id,
    );

    if (!response.success) {
      return ResponseUtil.error(
        response.error ?? "ERROR",
        "Failed to fetch hackathon details",
      );
    }

    return ResponseUtil.success(
      response.data,
      "Hackathon details fetched successfully",
    );
  } catch (error) {
    console.error("GET_HACKATHON_DETAILS :: route failed:", error);

    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong",
    );
  }
}