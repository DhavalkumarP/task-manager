import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { withAuth, AuthenticatedRequest } from "@/middleware/auth";
import { createProjectValidationSchema } from "@/lib/project-validation";
import {
  ICreateProjectRequest,
  IProjectResponse,
} from "@/types/backend/IProjectRequest";
import { ICommonResponse } from "@/types/common";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const projectsSnapshot = await adminDb
        .collection("projects")
        .where("userId", "==", req.user.id)
        .orderBy("createdAt", "desc")
        .get();

      const projects: IProjectResponse[] = projectsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        };
      });

      const response: ICommonResponse<IProjectResponse[]> = {
        success: true,
        message: "Projects retrieved successfully",
        data: projects,
      };

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const body: ICreateProjectRequest = await request.json();

      try {
        await createProjectValidationSchema.validate(body, {
          abortEarly: false,
        });
      } catch (validationError: any) {
        throw new ApiErrorHandler(
          validationError.errors
            ? validationError.errors.join(", ")
            : "Validation failed",
          400
        );
      }

      const { name, description } = body;

      const projectData = {
        userId: req.user.id,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await adminDb.collection("projects").add(projectData);
      const projectDoc = await docRef.get();
      const data = projectDoc.data();

      const project: IProjectResponse = {
        id: docRef.id,
        userId: data!.userId,
        name: data!.name,
        description: data!.description,
        createdAt: data!.createdAt.toDate().toISOString(),
        updatedAt: data!.updatedAt.toDate().toISOString(),
      };

      const response: ICommonResponse<IProjectResponse> = {
        success: true,
        message: "Project created successfully",
        data: project,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
