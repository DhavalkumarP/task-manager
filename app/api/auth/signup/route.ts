import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { generateToken } from "@/lib/jwt";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { signUpValidationSchema } from "@/lib/validation-schemas";
import { ISignUpRequest } from "@/types/backend/ISignUpRequest";
import { IAuthResponse } from "@/types/backend/IAuthResponse";
import { ICommonResponse } from "@/types/common";

export async function POST(request: NextRequest) {
  try {
    const body: ISignUpRequest = await request.json();

    try {
      await signUpValidationSchema.validate(body, { abortEarly: false });
    } catch (validationError: any) {
      throw new ApiErrorHandler(
        validationError.errors
          ? validationError.errors.join(", ")
          : "Validation failed",
        400
      );
    }

    const { fullName, email, password } = body;

    const usersRef = adminDb.collection("users");
    const existingUserSnapshot = await usersRef
      .where("email", "==", email)
      .get();

    if (!existingUserSnapshot.empty) {
      throw new ApiErrorHandler(
        "An account with this email already exists",
        409
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      id: userRecord.uid,
      email,
      fullName,
      hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersRef.doc(userRecord.uid).set(userData);

    const token = generateToken({
      id: userRecord.uid,
      email,
    });

    const authData: IAuthResponse = {
      token,
      user: {
        id: userRecord.uid,
        email,
        fullName,
        createdAt: userData.createdAt.toISOString(),
      },
    };

    const response: ICommonResponse<IAuthResponse> = {
      success: true,
      message: "Account created successfully",
      data: authData,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
