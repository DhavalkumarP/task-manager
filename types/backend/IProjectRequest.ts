export interface ICreateProjectRequest {
  name: string;
  description: string;
}

export interface IUpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface IProjectResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}