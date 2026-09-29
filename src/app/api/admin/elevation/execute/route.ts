import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") {
      return ResponseUtil.error(
        "UNAUTHORIZED",
        "User is not authorised to perform this action!",
      );
    }
    const data = await request.json();
    const response = await globalService.admin.executeElevation(data);
    if (!response.success) {
      return ResponseUtil.error(
        response?.error || "Something went wrong while executing elevation!",
        "Failed to execute elevation request",
      );
    }
    return ResponseUtil.success(
      true,
      "Elevation request processed successfully",
    );
  } catch (error) {
    console.error("Execute elevation failed:", error);
    return ResponseUtil.error(
      "INTERNAL_ERROR",
      "Something went wrong while processing the elevation request",
    );
  }
}
