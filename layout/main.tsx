import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";
import useUser from "@/hooks/useUser";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { token, getUserDetails } = useUser();

  useEffect(() => {
    if (token) {
      getUserDetails();
    }
  }, [token]);

  if (!token) {
    return redirect("/login");
  }

  return children;
};

export default MainLayout;
