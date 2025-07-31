import { TaskStatus } from "../common";

export interface ITask {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
