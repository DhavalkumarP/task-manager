import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message || error?.message || "Something went wrong"
    );
  } else {
    return "Something went wrong";
  }
};
