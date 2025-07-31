import { API } from "@/services/api";
import { ICommonResponse } from "@/types/common";
import { ITask } from "@/types/frontend/ITask";
import { ICreateTaskPayload } from "./types";

export const TaskAPI = {
  getTasks: async (projectId: string): Promise<ICommonResponse<ITask[]>> => {
    const response = await API.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  getTask: async (
    projectId: string,
    taskId: string
  ): Promise<ICommonResponse<ITask>> => {
    const response = await API.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
  createTask: async (
    projectId: string,
    data: ICreateTaskPayload
  ): Promise<ICommonResponse<ITask>> => {
    const response = await API.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },
  updateTask: async (
    projectId: string,
    taskId: string,
    data: Partial<ICreateTaskPayload>
  ): Promise<ICommonResponse<ITask>> => {
    const response = await API.put(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    );
    return response.data;
  },
  deleteTask: async (
    projectId: string,
    taskId: string
  ): Promise<ICommonResponse<null>> => {
    const response = await API.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
};
