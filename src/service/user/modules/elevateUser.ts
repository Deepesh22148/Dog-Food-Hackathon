import { ElevationRequestStatus } from "@/app/generated/prisma/enums";
import ResponseUtil from "@/app/lib/api/response";
import prismaClient from "@/app/lib/prisma/prismaClient";

export type ElevateResult =
  | { success: true; requestId: string }
  | {
      success: false;
      error: {
        code: "USER_NOT_FOUND" | "REQUEST_EXISTS" | "INTERNAL_ERROR";
      };
    };

export type ElevateStatusResult =
  | { success: true; status: ElevationRequestStatus | null }
  | { success: false; error: { code: "INTERNAL_ERROR"; message: string } };

// only job is to put it inside the elevationTable
export const elevateUser = async (user_id: string): Promise<ElevateResult> => {
  try {
    const currentUser = await prismaClient.user.findUnique({
      where: { id: user_id },
      select: { id: true },
    });

    if (!currentUser) {
      return {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
        },
      };
    }

    const existingRequest = await prismaClient.elevationRequest.findFirst({
      where: { user_id, status: "PENDING" },
      select: { id: true },
    });

    if (existingRequest) {
      return {
        success: false,
        error: {
          code: "REQUEST_EXISTS",
        },
      };
    }

    const request = await prismaClient.elevationRequest.create({
      data: { user_id },
      select: { id: true },
    });

    return { success: true, requestId: request.id };
  } catch (error) {
    console.error("elevateUser failed:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
      },
    };
  }
};

export const elevateStatus = async (user_id: string): Promise<ElevateStatusResult> => {
  try {
    const response = await prismaClient.elevationRequest.findFirst({
      where: {
        user_id,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        status: true,
      },
    });

    return {
      success: true,
      status: response?.status ?? null,
    };
  } catch (error) {
    console.error("elevateStatus failed:", error);

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong while fetching elevation status",
      },
    };
  }
};
