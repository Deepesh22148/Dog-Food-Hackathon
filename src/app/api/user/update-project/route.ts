import ResponseUtil from "@/app/lib/api/response";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import globalService from "@/service/globalService";

export async function POST(request: Request) {
  try {
    const [user] = await Promise.all([getCurrentUser()]);

    const payload = await request.json();

    if (!user) {
      return ResponseUtil.error("Unauthorized", "Session missing or expired");
    }

    const response = await globalService.user.updateProject(user.id , payload);

    if (!response.success) {
      console.error("CREATE PROJECT ::: Failed:", response.error);

      return ResponseUtil.error(
        response.error?.code || "CREATE_PROJECT_FAILED",
        response.error?.message ?? "Failed to accept team member",
      );
    }

    return ResponseUtil.success(
      response.data,
      "create project successfully!",
    );
  } catch (error) {
    console.error("CREATE PROJECT FAILED ::: Error:", error);

    return ResponseUtil.error("Internal Server Error", "Something went wrong.");
  }
}
