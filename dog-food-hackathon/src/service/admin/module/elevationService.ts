import { ElevationRequestStatus } from "@/app/generated/prisma/enums";
import prismaClient from "@/app/lib/prisma/prismaClient";

type executeElevationType = {
  entry_id: string;
  action: ElevationRequestStatus;
};
const elevationService = {
  getList: async () => {
    const requests = await prismaClient.elevationRequest.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        user_id: true,
        status: true,
        created_at: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { created_at: "asc" },
    });

    return requests;
  },
  executeElevation: async (data: executeElevationType) => {
    try {
      const request = await prismaClient.elevationRequest.findUnique({
        where: { id: data.entry_id },
        select: { id: true, user_id: true, status: true },
      });
      if (!request) {
        return { success: false, error: "REQUEST_NOT_FOUND" };
      }
      if (request.status !== "PENDING") {
        return { success: false, error: "REQUEST_ALREADY_PROCESSED" };
      }
      await prismaClient.$transaction(async (tx) => {
        await tx.elevationRequest.update({
          where: { id: request.id },
          data: { status: data.action },
        });
        if (data.action === "APPROVED") {
          await tx.user.update({
            where: { id: request.user_id },
            data: { is_organizer: true },
          });
        }
      });
      return { success: true };
    } catch (error) {
      console.error("executeElevation failed:", error);
      return { success: false, error: "INTERNAL_ERROR" };
    }
  },
};

export default elevationService;
