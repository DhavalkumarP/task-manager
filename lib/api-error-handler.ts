import { ICommonResponse } from "@/types/common";
import { NextResponse } from "next/server";

export class ApiErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export const handleApiError = (
  error: any
): NextResponse<ICommonResponse<null>> => {
  let message: string;
  let statusCode: number;

  if (error instanceof ApiErrorHandler) {
    message = error.message;
    statusCode = error.statusCode;
  } else if (error.code === "auth/email-already-exists") {
    message = "An account with this email already exists";
    statusCode = 409;
  } else if (error.code === "auth/user-not-found") {
    message = "No user found with this email";
    statusCode = 404;
  } else if (error.code === "auth/wrong-password") {
    message = "Invalid email or password";
    statusCode = 401;
  } else if (error.code === "auth/invalid-email") {
    message = "The email address is invalid";
    statusCode = 400;
  } else if (error.code === "auth/weak-password") {
    message = "The password is too weak";
    statusCode = 400;
  } else {
    message = "An unexpected error occurred";
    statusCode = 500;
  }

  return NextResponse.json<ICommonResponse<null>>(
    {
      success: false,
      message,
      data: null,
    },
    { status: statusCode }
  );
};
