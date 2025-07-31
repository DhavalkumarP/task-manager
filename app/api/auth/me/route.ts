import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { withAuth, AuthenticatedRequest } from "@/middleware/auth";
import { IUserData } from "@/types/backend/IAuthResponse";
import { ICommonResponse } from "@/types/common";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const userDoc = await adminDb.collection("users").doc(req.user.id).get();

      if (!userDoc.exists) {
        throw new ApiErrorHandler("User not found", 404);
      }

      const userData = userDoc.data();

      const user: IUserData = {
        id: userData?.id,
        email: userData?.email,
        fullName: userData?.fullName,
        createdAt: userData?.createdAt.toDate().toISOString(),
      };

      const response: ICommonResponse<IUserData> = {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
