import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {

  const result = await getCurrentUser();
  
  return ResponseUtil.success(result, "Logout out successful");
}
