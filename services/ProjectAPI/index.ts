import { API } from "@/services/api";
import { ICommonResponse } from "@/types/common";
import { IProject } from "@/types/frontend/IProject";
import { ICreateProjectPayload } from "./types";

export const ProjectAPI = {
  getProjects: async (): Promise<ICommonResponse<IProject[]>> => {
    const response = await API.get("/projects");
    return response.data;
  },
  getProject: async (projectId: string): Promise<ICommonResponse<IProject>> => {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  },
  createProject: async (
    data: ICreateProjectPayload
  ): Promise<ICommonResponse<IProject>> => {
    const response = await API.post("/projects", data);
    return response.data;
  },
  updateProject: async (
    projectId: string,
    data: Partial<ICreateProjectPayload>
  ): Promise<ICommonResponse<IProject>> => {
    const response = await API.put(`/projects/${projectId}`, data);
    return response.data;
  },
  deleteProject: async (projectId: string): Promise<ICommonResponse> => {
    const response = await API.delete(`/projects/${projectId}`);
    return response.data;
  },
};
