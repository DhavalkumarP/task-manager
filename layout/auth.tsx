import useUser from "@/hooks/useUser";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { token } = useUser();

  if (token) {
    return redirect("/");
  }

  return children;
};

export default AuthLayout;
