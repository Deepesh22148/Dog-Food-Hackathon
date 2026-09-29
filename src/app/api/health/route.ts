import ResponseUtil from "@/app/lib/api/response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	return ResponseUtil.success("string" , "sdsd")
}
    