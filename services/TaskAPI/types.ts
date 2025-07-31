import { TaskStatus } from "@/types/common";

export interface ICreateTaskPayload {
  title: string;
  status?: TaskStatus;
  dueDate?: string;
}
