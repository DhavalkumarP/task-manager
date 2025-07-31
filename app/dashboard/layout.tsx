"use client";

import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useState } from "react";
import useUser from "@/hooks/useUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { userDetails, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box className="h-full bg-gradient-to-b from-white to-blue-50/30">
      <List className="px-3">
        <ListItem
          component="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 mb-2"
        >
          <ListItemIcon className="min-w-0 mr-3">
            <Box className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <DashboardIcon className="text-white text-xl" />
            </Box>
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            slotProps={{
              primary: {
                className: "font-semibold text-gray-800",
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppBar
        position="fixed"
        elevation={0}
        className="backdrop-blur-md bg-white/80 border-b border-gray-200/50"
      >
        <Toolbar className="px-4 sm:px-6">
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2 text-gray-700 hover:bg-blue-50 transition-colors"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box className="flex items-center gap-3 flex-grow">
            <Box className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <AssignmentIcon className="text-white text-xl" />
            </Box>
            <Typography
              variant="h6"
              component="div"
              className="font-bold text-white"
            >
              Task Manager
            </Typography>
          </Box>
          <Box className="flex items-center gap-3">
            <Typography className="text-white font-medium">
              {userDetails?.fullName || userDetails?.email}
            </Typography>
            <IconButton
              onClick={logout}
              color="inherit"
              className="transition-all duration-200"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          className="sm:hidden"
          slotProps={{
            paper: {
              className: "w-64",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box className="flex">
        {!isMobile && (
          <Drawer
            variant="permanent"
            className="hidden sm:block bg-gradient-to-b from-white"
            slotProps={{
              paper: {
                className:
                  "w-64 mt-16 h-[calc(100vh-64px)] border-r border-gray-200/50",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          className={`flex-grow ${isMobile ? "pt-20" : "pt-20 ml-64"}`}
        >
          <Container maxWidth="lg" className="py-8">
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
