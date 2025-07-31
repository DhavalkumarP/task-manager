import { ITask } from "@/types/frontend/ITask";

export interface TaskState {
  tasks: Record<string, ITask[]>;
}
