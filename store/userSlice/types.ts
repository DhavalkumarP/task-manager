import { IUser } from "../../types/frontend/IUser";

export interface UserState {
  token: string;
  userDetails: IUser | null;
}
