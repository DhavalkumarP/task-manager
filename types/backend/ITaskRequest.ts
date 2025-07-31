import { TaskStatus } from "@/types/common";

export interface ICreateTaskRequest {
  title: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface IUpdateTaskRequest {
  title?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface ITaskResponse {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
