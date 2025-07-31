import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { withAuth, AuthenticatedRequest } from "@/middleware/auth";
import { updateTaskValidationSchema } from "@/lib/task-validation";
import {
  IUpdateTaskRequest,
  ITaskResponse,
} from "@/types/backend/ITaskRequest";
import { ICommonResponse } from "@/types/common";

interface RouteParams {
  params: Promise<{
    projectId: string;
    taskId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const { projectId, taskId } = await params;

      const projectDoc = await adminDb
        .collection("projects")
        .doc(projectId)
        .get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const projectData = projectDoc.data();
      if (projectData!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const taskDoc = await adminDb.collection("tasks").doc(taskId).get();

      if (!taskDoc.exists) {
        throw new ApiErrorHandler("Task not found", 404);
      }

      const data = taskDoc.data();

      if (data!.projectId !== projectId) {
        throw new ApiErrorHandler("Task does not belong to this project", 403);
      }

      const task: ITaskResponse = {
        id: taskDoc.id,
        projectId: data!.projectId,
        title: data!.title,
        status: data!.status,
        dueDate: data!.dueDate
          ? data!.dueDate.toDate().toISOString()
          : undefined,
        createdAt: data!.createdAt.toDate().toISOString(),
        updatedAt: data!.updatedAt.toDate().toISOString(),
      };

      const response: ICommonResponse<ITaskResponse> = {
        success: true,
        message: "Task retrieved successfully",
        data: task,
      };

      return NextResponse.json(response);
    } catch (error) {
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

      const { projectId, taskId } = await params;
      const body: IUpdateTaskRequest = await request.json();

      try {
        await updateTaskValidationSchema.validate(body, { abortEarly: false });
      } catch (validationError: any) {
        throw new ApiErrorHandler(
          validationError.errors
            ? validationError.errors.join(", ")
            : "Validation failed",
          400
        );
      }

      const projectDoc = await adminDb
        .collection("projects")
        .doc(projectId)
        .get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const projectData = projectDoc.data();
      if (projectData!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const taskRef = adminDb.collection("tasks").doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        throw new ApiErrorHandler("Task not found", 404);
      }

      const currentData = taskDoc.data();
      if (currentData!.projectId !== projectId) {
        throw new ApiErrorHandler("Task does not belong to this project", 403);
      }

      const updateData: any = {
        ...body,
        updatedAt: new Date(),
      };

      if (body.dueDate !== undefined) {
        updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      }

      await taskRef.update(updateData);

      const updatedDoc = await taskRef.get();
      const data = updatedDoc.data();

      const task: ITaskResponse = {
        id: updatedDoc.id,
        projectId: data!.projectId,
        title: data!.title,
        status: data!.status,
        dueDate: data!.dueDate
          ? data!.dueDate.toDate().toISOString()
          : undefined,
        createdAt: data!.createdAt.toDate().toISOString(),
        updatedAt: data!.updatedAt.toDate().toISOString(),
      };

      const response: ICommonResponse<ITaskResponse> = {
        success: true,
        message: "Task updated successfully",
        data: task,
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

      const { projectId, taskId } = await params;

      const projectDoc = await adminDb
        .collection("projects")
        .doc(projectId)
        .get();

      if (!projectDoc.exists) {
        throw new ApiErrorHandler("Project not found", 404);
      }

      const projectData = projectDoc.data();
      if (projectData!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const taskRef = adminDb.collection("tasks").doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        throw new ApiErrorHandler("Task not found", 404);
      }

      const taskData = taskDoc.data();
      if (taskData!.projectId !== projectId) {
        throw new ApiErrorHandler("Task does not belong to this project", 403);
      }

      await taskRef.delete();

      const response: ICommonResponse<null> = {
        success: true,
        message: "Task deleted successfully",
        data: null,
      };

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
