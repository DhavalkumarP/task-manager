export interface IAuthResponse {
  token: string;
  user: IUserData;
}

export interface IUserData {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}
