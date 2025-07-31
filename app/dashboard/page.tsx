"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as ProjectIcon,
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Typography variant="h4" className="font-bold text-gray-800">
          My Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProject(null);
            setOpenDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 normal-case"
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ProjectIcon className="text-6xl text-gray-300 mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No projects yet
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              Create your first project to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 normal-case"
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardContent>
                  <Box className="flex justify-between items-start mb-2">
                    <Typography
                      variant="h6"
                      className="font-semibold text-gray-800 flex-grow"
                    >
                      {project.name}
                    </Typography>
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
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    className="text-gray-600 mb-4 line-clamp-3"
                  >
                    {project.description}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    className="text-blue-600 hover:text-blue-800 normal-case"
                  >
                    View Tasks →
                  </Button>
                </CardActions>
              </Card>
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
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
              <DialogContent>
                <Box className="space-y-4 mt-2">
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    autoFocus
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
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpenDialog(false);
                    setEditingProject(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : editingProject ? (
                    "Update"
                  ) : (
                    "Create"
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
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deletingProject?.name}&quot;?
            This will also delete all tasks associated with this project.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingProject(null)}>Cancel</Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
