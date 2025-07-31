"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";
import AuthLayout from "@/layout/auth";
import MainLayout from "@/layout/main";

type Props = {
  children: React.ReactNode;
};

const theme = createTheme();

const PUBLIC_ROUTES = ["/login", "/register"];

const ProviderWrapper = ({ children }: Props) => {
  const pathname = usePathname();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {PUBLIC_ROUTES.includes(pathname) ? (
            <AuthLayout>{children}</AuthLayout>
          ) : (
            <MainLayout>{children}</MainLayout>
          )}
          <Toaster position="top-right" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default ProviderWrapper;
