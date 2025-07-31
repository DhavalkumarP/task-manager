"use client";

import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
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
    <Box className="h-full bg-gray-50">
      <List>
        <ListItem className="py-4 px-6">
          <ListItemIcon>
            <AssignmentIcon className="text-blue-600" />
          </ListItemIcon>
          <ListItemText
            primary="Task Manager"
            primaryTypographyProps={{
              className: "font-bold text-gray-800",
            }}
          />
        </ListItem>
        <ListItem
          component="button"
          onClick={() => router.push("/dashboard")}
          className="hover:bg-blue-50 transition-colors"
        >
          <ListItemIcon>
            <DashboardIcon className="text-gray-600" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-gray-100">
      <AppBar
        position="fixed"
        elevation={0}
        className="bg-white border-b border-gray-200"
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2 text-gray-700"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            className="flex-grow text-gray-800 font-semibold"
          >
            Task Manager
          </Typography>
          <Box className="flex items-center gap-4">
            <Typography className="text-gray-600 hidden sm:block">
              {userDetails?.fullName || userDetails?.email}
            </Typography>
            <Button
              onClick={logout}
              startIcon={<LogoutIcon />}
              className="normal-case text-gray-700 hover:text-red-600"
            >
              Logout
            </Button>
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
          PaperProps={{
            className: "w-64",
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box className="flex">
        {!isMobile && (
          <Drawer
            variant="permanent"
            className="hidden sm:block"
            PaperProps={{
              className: "w-64 mt-16 h-[calc(100vh-64px)]",
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          className={`flex-grow ${isMobile ? "pt-16" : "pt-16 ml-64"}`}
        >
          <Container maxWidth="lg" className="py-8">
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
