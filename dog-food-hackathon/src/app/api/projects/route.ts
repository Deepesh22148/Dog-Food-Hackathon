// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

const STATUS: Record<string, number> = {
  VALIDATION_ERROR: 400,
  INVALID_TRACK: 400,
  NOT_PARTICIPATING: 403,
  NO_TEAM: 403,
  NOT_TEAM_LEADER: 403,
  SUBMISSION_NOT_OPEN: 403,
  SUBMISSION_CLOSED: 403,
  PROJECT_ALREADY_EXISTS: 409,
  INTERNAL_ERROR: 500,
};

// Public: no session needed
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const result = await globalService.user.getGallery({
    q: sp.get("q") ?? undefined,
    hackathon_id: sp.get("hackathon") ?? undefined,
    track_id: sp.get("track") ?? undefined,
    page: Number(sp.get("page")) || 1,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return ResponseUtil.success(result.data, "Gallery fetched successfully");
}