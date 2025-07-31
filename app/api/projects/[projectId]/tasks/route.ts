import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handleApiError, ApiErrorHandler } from "@/lib/api-error-handler";
import { withAuth, AuthenticatedRequest } from "@/middleware/auth";
import { createTaskValidationSchema } from "@/lib/task-validation";
import {
  ICreateTaskRequest,
  ITaskResponse,
} from "@/types/backend/ITaskRequest";
import { ICommonResponse } from "@/types/common";
import { TaskStatus } from "@/types/common";

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

      const projectData = projectDoc.data();
      if (projectData!.userId !== req.user.id) {
        throw new ApiErrorHandler("Unauthorized access to project", 403);
      }

      const tasksSnapshot = await adminDb
        .collection("tasks")
        .where("projectId", "==", projectId)
        .orderBy("createdAt", "desc")
        .get();

      const tasks: ITaskResponse[] = tasksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          projectId: data.projectId,
          title: data.title,
          status: data.status,
          dueDate: data.dueDate
            ? data.dueDate.toDate().toISOString()
            : undefined,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        };
      });

      const response: ICommonResponse<ITaskResponse[]> = {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.log("Error fetching tasks:", error);
      return handleApiError(error);
    }
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new ApiErrorHandler("User not authenticated", 401);
      }

      const { projectId } = await params;
      const body: ICreateTaskRequest = await request.json();

      try {
        await createTaskValidationSchema.validate(body, { abortEarly: false });
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

      const { title, status = TaskStatus.TODO, dueDate } = body;

      const taskData = {
        projectId,
        title,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await adminDb.collection("tasks").add(taskData);
      const taskDoc = await docRef.get();
      const data = taskDoc.data();

      const task: ITaskResponse = {
        id: docRef.id,
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
        message: "Task created successfully",
        data: task,
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
