export interface ICommonResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}
