import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { ICommonResponse } from "@/services/types";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json<ICommonResponse<null>>(
        {
          success: false,
          message: "Authorization header is required",
          data: null,
        },
        { status: 401 }
      );
    }

    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: payload.id,
      email: payload.email,
    };

    return handler(authenticatedRequest);
  } catch (error: any) {
    return NextResponse.json<ICommonResponse<null>>(
      {
        success: false,
        message: error.message || "Invalid or expired token",
        data: null,
      },
      { status: 401 }
    );
  }
}
