import { IUser } from "@/types/frontend/IUser";
import { API } from "../api";
import { ISignUpPayload, ISignInPayload } from "./types";
import { ISignUp } from "@/types/frontend/ISignUp";
import { ICommonResponse } from "@/types/common";

export const AuthAPI = {
  signUp: async function (
    payload: ISignUpPayload
  ): Promise<ICommonResponse<ISignUp>> {
    const response = await API.request({
      url: "/auth/signup",
      method: "POST",
      data: payload,
    });
    return response.data;
  },
  signIn: async function (
    payload: ISignInPayload
  ): Promise<ICommonResponse<ISignUp>> {
    const response = await API.request({
      url: "/auth/signin",
      method: "POST",
      data: payload,
    });
    return response.data;
  },
  me: async function (): Promise<ICommonResponse<IUser>> {
    const response = await API.request({
      url: "/auth/me",
      method: "GET",
    });
    return response.data;
  },
};
