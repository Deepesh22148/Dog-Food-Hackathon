import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hasAcceptedJudgeEntry } from "@/lib/auth/hasAcceptedJudgeEntry";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  const judge = request.nextUrl.searchParams.get("judge");
  if (!user) {
    return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
  }
  if (judge && judge !== user.id) {
    return ResponseUtil.error("UNAUTHORIZED", "Session missing or expired");
  }
  const isJudge = await hasAcceptedJudgeEntry(user?.id);
  if (!isJudge) {
    return ResponseUtil.error("UNAUTHORIZED", "not judge");
  }
  const result = await globalService.judge.getJudgeScore(user.id);
  console.log(result);
  if (!result.success) {
    return ResponseUtil.error(
      result?.error?.code || "Error while reviewing hackathon submission",
      "Error while reviewing hackathon submission!",
    );
  }
  return ResponseUtil.success(result.success, "hackathon reviewed !");
}
