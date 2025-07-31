"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Grid,
  CardContent,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as ProjectIcon,
} from "@mui/icons-material";
import { ProjectAPI } from "@/services/ProjectAPI";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helper";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { IProject } from "@/types/frontend/IProject";

const projectSchema = Yup.object({
  name: Yup.string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters")
    .required("Project name is required"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
});

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<IProject | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectAPI.getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      const response = await ProjectAPI.createProject(values);
      if (response.success) {
        toast.success("Project created successfully");
        setOpenDialog(false);
        fetchProjects();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateProject = async (values: {
    name: string;
    description: string;
  }) => {
    if (!editingProject) return;

    try {
      const response = await ProjectAPI.updateProject(
        editingProject.id,
        values
      );
      if (response.success) {
        toast.success("Project updated successfully");
        setOpenDialog(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    try {
      const response = await ProjectAPI.deleteProject(deletingProject.id);
      if (response.success) {
        toast.success("Project deleted successfully");
        setDeletingProject(null);
        fetchProjects();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress className="text-blue-600" size={48} />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        className="mb-8 p-8 backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-white/50"
      >
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Box>
            <Typography
              variant="h4"
              className="font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            >
              My Projects
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Manage and organize your projects efficiently
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingProject(null);
              setOpenDialog(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium px-6 py-2.5"
          >
            New Project
          </Button>
        </Box>
      </Paper>

      {projects.length === 0 ? (
        <Paper
          elevation={0}
          className="text-center py-16 backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl"
        >
          <Box className="flex flex-col items-center">
            <Box className="flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
              <ProjectIcon className="text-5xl text-blue-600" />
            </Box>
            <Typography variant="h5" className="font-bold text-gray-800 mb-2">
              No projects yet
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6 max-w-sm">
              Create your first project to start managing your tasks efficiently
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium"
            >
              Create Your First Project
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Paper
                elevation={0}
                className="h-full backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardContent className="p-6 min-w-[300px]">
                  <Box className="flex justify-between items-center mb-4">
                    <Box className="flex items-center gap-3 flex-grow">
                      <Box className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                        <ProjectIcon className="text-blue-600" />
                      </Box>
                      <Typography
                        variant="h6"
                        className="font-bold text-gray-800"
                      >
                        {project.name}
                      </Typography>
                    </Box>
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      className="flex gap-1"
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setOpenDialog(true);
                        }}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    className="text-gray-600 mb-4 line-clamp-2"
                  >
                    {project.description}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box className="mt-4 flex justify-end">
                    <Button
                      size="small"
                      className="text-blue-600 hover:text-blue-800 normal-case font-medium"
                      endIcon={<span>→</span>}
                    >
                      View Tasks
                    </Button>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingProject(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            className: "backdrop-blur-sm bg-white/95 rounded-2xl shadow-2xl",
          },
        }}
      >
        <Formik
          initialValues={{
            name: editingProject?.name || "",
            description: editingProject?.description || "",
          }}
          validationSchema={projectSchema}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <DialogTitle className="text-center pb-0">
                <Box className="flex flex-row gap-2 items-center">
                  <Box className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                    <ProjectIcon className="text-3xl text-blue-600" />
                  </Box>
                  <Typography variant="h5" className="font-bold text-gray-800">
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box className="flex flex-col gap-y-4 mt-4">
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    className="bg-gray-50"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    multiline
                    rows={4}
                    className="bg-gray-50"
                    slotProps={{
                      input: { className: "rounded-lg" },
                    }}
                  />
                </Box>
              </DialogContent>
              <DialogActions className="p-6 pt-2">
                <Button
                  onClick={() => {
                    setOpenDialog(false);
                    setEditingProject(null);
                  }}
                  disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium"
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} className="text-white" />
                  ) : editingProject ? (
                    "Update Project"
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog
        open={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            className: "backdrop-blur-sm bg-white/95 rounded-2xl shadow-2xl",
          },
        }}
      >
        <DialogTitle className="text-center pb-0">
          <Box className="flex flex-col items-center">
            <Box className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-4">
              <DeleteIcon className="text-3xl text-red-600" />
            </Box>
            <Typography variant="h5" className="font-bold text-gray-800">
              Delete Project
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="text-center">
          <Typography className="text-gray-600">
            Are you sure you want to delete
          </Typography>
          <Typography className="font-semibold text-gray-800 my-2">
            &quot;{deletingProject?.name}&quot;?
          </Typography>
          <Typography variant="body2" className="text-gray-500 mt-4">
            This action cannot be undone. All tasks associated with this project
            will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions className="p-6 pt-2 justify-center gap-3">
          <Button
            onClick={() => setDeletingProject(null)}
            className="text-gray-600 hover:text-gray-800 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium"
          >
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
