import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { generateToken } from "@/lib/jwt";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { signInValidationSchema } from "@/lib/validation-schemas";
import { ISignInRequest } from "@/types/backend/ISignInRequest";
import { IAuthResponse } from "@/types/backend/IAuthResponse";
import { ICommonResponse } from "@/types/common";

export async function POST(request: NextRequest) {
  try {
    const body: ISignInRequest = await request.json();

    try {
      await signInValidationSchema.validate(body, { abortEarly: false });
    } catch (validationError: any) {
      throw new ApiErrorHandler(
        validationError.errors
          ? validationError.errors.join(", ")
          : "Validation failed",
        400
      );
    }

    const { email, password } = body;

    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      throw new ApiErrorHandler("Invalid email or password", 401);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordValid = await bcrypt.compare(
      password,
      userData.hashedPassword
    );

    if (!isPasswordValid) {
      throw new ApiErrorHandler("Invalid email or password", 401);
    }

    try {
      await adminAuth.getUser(userData.id);
    } catch (error) {
      throw new ApiErrorHandler("User authentication error", 500);
    }

    const token = generateToken({
      id: userData.id,
      email: userData.email,
    });

    const authData: IAuthResponse = {
      token,
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        createdAt: userData.createdAt.toDate().toISOString(),
      },
    };

    const response: ICommonResponse<IAuthResponse> = {
      success: true,
      message: "Signed in successfully",
      data: authData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
