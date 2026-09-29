import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hasAcceptedJudgeEntry } from "@/lib/auth/hasAcceptedJudgeEntry";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
  }
  const isJudge = await hasAcceptedJudgeEntry(user?.id);
  if (!isJudge) {
    return ResponseUtil.error("UNAUTHORIZED", "not judge");
  }
  const payload = await request.json();
  const result = await globalService.judge.getProjectDetails(
    payload.project_id,
    payload.hackathon_id,
    user.id,
  );

  return ResponseUtil.success(result, "hackathon detail fetched!");
}
