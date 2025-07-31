import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { withAuth, AuthenticatedRequest } from "@/middleware/auth";
import { updateProjectValidationSchema } from "@/lib/project-validation";
import {
  IUpdateProjectRequest,
  IProjectResponse,
} from "@/types/backend/IProjectRequest";
import { ICommonResponse } from "@/types/common";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const projectDoc = await adminDb
        .collection("projects")
        .doc(projectId)
        .get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const data = projectDoc.data();

      if (data!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const project: IProjectResponse = {
        id: projectDoc.id,
        userId: data!.userId,
        name: data!.name,
        description: data!.description,
        createdAt: data!.createdAt.toDate().toISOString(),
        updatedAt: data!.updatedAt.toDate().toISOString(),
      };

      const response: ICommonResponse<IProjectResponse> = {
        success: true,
        message: "Project retrieved successfully",
        data: project,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.log("Error fetching project:", error);
      return handleApiError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const { projectId } = await params;
      const body: IUpdateProjectRequest = await request.json();

      try {
        await updateProjectValidationSchema.validate(body, {
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

      const projectRef = adminDb.collection("projects").doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const currentData = projectDoc.data();
      if (currentData!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const updateData = {
        ...body,
        updatedAt: new Date(),
      };

      await projectRef.update(updateData);

      const updatedDoc = await projectRef.get();
      const data = updatedDoc.data();

      const project: IProjectResponse = {
        id: updatedDoc.id,
        userId: data!.userId,
        name: data!.name,
        description: data!.description,
        createdAt: data!.createdAt.toDate().toISOString(),
        updatedAt: data!.updatedAt.toDate().toISOString(),
      };

      const response: ICommonResponse<IProjectResponse> = {
        success: true,
        message: "Project updated successfully",
        data: project,
      };

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const { projectId } = await params;
      const projectRef = adminDb.collection("projects").doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const data = projectDoc.data();
      if (data!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const tasksSnapshot = await adminDb
        .collection("tasks")
        .where("projectId", "==", projectId)
        .get();

      const batch = adminDb.batch();

      tasksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      batch.delete(projectRef);

      await batch.commit();

      const response: ICommonResponse<null> = {
        success: true,
        message: "Project and associated tasks deleted successfully",
        data: null,
      };

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
