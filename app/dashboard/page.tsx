"use client";

import { useState, useEffect } from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as ProjectIcon,
  CalendarToday as CalendarIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";
import { ProjectAPI } from "@/services/ProjectAPI";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { IProject } from "@/types/frontend/IProject";
import useProject from "@/hooks/useProject";
import ProjectDialog from "@/components/ProjectDialog";
import DeleteProjectDialog from "@/components/DeleteProjectDialog";

export default function DashboardPage() {
  const router = useRouter();
  const { getProjects, isProjectLoading, projects } = useProject();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<IProject | null>(null);

  useEffect(() => {
    getProjects();
  }, []);

  const handleCreateProject = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      const response = await ProjectAPI.createProject(values);
      if (response.success) {
        await getProjects(false);
        toast.success("Project created successfully");
        setOpenDialog(false);
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
        await getProjects(false);
        toast.success("Project updated successfully");
        setOpenDialog(false);
        setEditingProject(null);
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
        await getProjects(false);
        toast.success("Project deleted successfully");
        setDeletingProject(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (isProjectLoading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress className="text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="mt-2 text-gray-600">
                Manage and organize your projects efficiently
              </p>
            </div>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingProject(null);
                setOpenDialog(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 normal-case font-medium px-6 py-2.5"
            >
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl py-8">
        {projects.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FolderOpenIcon className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No projects yet
              </h2>
              <p className="text-gray-600 mb-8">
                Create your first project to start managing your tasks
                efficiently
              </p>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 normal-case font-medium"
              >
                Create Your First Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden"
                onClick={() => handleOpenProject(project.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ProjectIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setOpenDialog(true);
                        }}
                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center">
                      View Tasks
                      <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
      />

      <DeleteProjectDialog
        open={!!deletingProject}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
