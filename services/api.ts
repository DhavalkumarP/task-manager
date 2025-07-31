import axios from "axios";
import { store } from "../store";

export const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Accept-Language"] = "en";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
