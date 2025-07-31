"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, CircularProgress, IconButton, Chip } from "@mui/material";
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  Schedule as InProgressIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { ProjectAPI } from "@/services/ProjectAPI";
import { TaskAPI } from "@/services/TaskAPI";
import { TaskStatus } from "@/types/common";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helper";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { IProject } from "@/types/frontend/IProject";
import { ITask } from "@/types/frontend/ITask";
import useTask from "@/hooks/useTask";
import TaskDialog from "@/components/TaskDialog";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return <TodoIcon className="text-gray-500" />;
    case TaskStatus.IN_PROGRESS:
      return <InProgressIcon className="text-indigo-500" />;
    case TaskStatus.DONE:
      return <DoneIcon className="text-green-500" />;
  }
};

const getStatusChip = (status: TaskStatus) => {
  const statusConfig = {
    [TaskStatus.TODO]: {
      label: "To Do",
      className: "bg-gray-100 text-gray-700",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700",
    },
    [TaskStatus.DONE]: {
      label: "Done",
      className: "bg-green-100 text-green-700",
    },
  };

  const config = statusConfig[status];
  return (
    <Chip label={config.label} size="small" className={config.className} />
  );
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { tasks, isTaskLoading, getTasks } = useTask(projectId);

  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [deletingTask, setDeletingTask] = useState<ITask | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">(
    "all"
  );

  const fetchProjectAndTasks = async (loading = true) => {
    try {
      setLoading(loading);
      const [projectResponse] = await Promise.all([
        ProjectAPI.getProject(projectId),
        getTasks(),
      ]);

      if (projectResponse.success) {
        setProject(projectResponse.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const handleCreateTask = async (values: any) => {
    try {
      const taskData = {
        title: values.title,
        status: values.status,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      const response = await TaskAPI.createTask(projectId, taskData);
      if (response.success) {
        await getTasks(false);
        toast.success("Task created successfully");
        setOpenTaskDialog(false);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateTask = async (values: any) => {
    if (!editingTask) return;

    try {
      const taskData = {
        title: values.title,
        status: values.status,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      const response = await TaskAPI.updateTask(
        projectId,
        editingTask.id,
        taskData
      );
      if (response.success) {
        await getTasks(false);
        toast.success("Task updated successfully");
        setOpenTaskDialog(false);
        setEditingTask(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      const response = await TaskAPI.deleteTask(projectId, deletingTask.id);
      if (response.success) {
        await getTasks(false);
        toast.success("Task deleted successfully");
        setDeletingTask(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleQuickStatusUpdate = async (
    task: ITask,
    newStatus: TaskStatus
  ) => {
    try {
      const response = await TaskAPI.updateTask(projectId, task.id, {
        status: newStatus,
      });
      if (response.success) {
        toast.success("Task status updated");
        fetchProjectAndTasks(false);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredTasks =
    selectedStatus === "all"
      ? tasks
      : tasks.filter((task) => task.status === selectedStatus);

  const tasksByStatus = {
    [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS
    ),
    [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
  };

  if ((isTaskLoading || loading) && (tasks?.length === 0 || !project)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress className="text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-800 -ml-2"
            >
              Back to Projects
            </Button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {project?.name}
                </h1>
                <p className="mt-2 text-gray-600">{project?.description}</p>
              </div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTask(null);
                  setOpenTaskDialog(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 normal-case font-medium px-6 py-2.5"
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-lg p-6 text-left transition-all duration-200 ${
                selectedStatus === "all"
                  ? "ring-2 ring-indigo-500 shadow-md"
                  : "hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasks.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TaskIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus(TaskStatus.TODO)}
              className={`relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-lg p-6 text-left transition-all duration-200 ${
                selectedStatus === TaskStatus.TODO
                  ? "ring-2 ring-gray-500 shadow-md"
                  : "hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">To Do</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tasksByStatus[TaskStatus.TODO].length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TodoIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus(TaskStatus.IN_PROGRESS)}
              className={`relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-lg p-6 text-left transition-all duration-200 ${
                selectedStatus === TaskStatus.IN_PROGRESS
                  ? "ring-2 ring-indigo-500 shadow-md"
                  : "hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {tasksByStatus[TaskStatus.IN_PROGRESS].length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <InProgressIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedStatus(TaskStatus.DONE)}
              className={`relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-lg p-6 text-left transition-all duration-200 ${
                selectedStatus === TaskStatus.DONE
                  ? "ring-2 ring-green-500 shadow-md"
                  : "hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Done</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tasksByStatus[TaskStatus.DONE].length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DoneIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {selectedStatus === "all"
                      ? "All Tasks"
                      : selectedStatus === TaskStatus.TODO
                      ? "To Do Tasks"
                      : selectedStatus === TaskStatus.IN_PROGRESS
                      ? "In Progress Tasks"
                      : "Completed Tasks"}
                  </span>
                  <span className="text-gray-500">
                    ({filteredTasks.length})
                  </span>
                </div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <TaskIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {selectedStatus === "all"
                    ? "Create your first task to get started with this project"
                    : `No tasks with status "${
                        selectedStatus === TaskStatus.TODO
                          ? "To Do"
                          : selectedStatus === TaskStatus.IN_PROGRESS
                          ? "In Progress"
                          : "Done"
                      }"`}
                </p>
                {selectedStatus === "all" && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenTaskDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 normal-case font-medium"
                  >
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <IconButton
                        onClick={() => {
                          const nextStatus =
                            task.status === TaskStatus.TODO
                              ? TaskStatus.IN_PROGRESS
                              : task.status === TaskStatus.IN_PROGRESS
                              ? TaskStatus.DONE
                              : TaskStatus.TODO;
                          handleQuickStatusUpdate(task, nextStatus);
                        }}
                        className="hover:scale-110 transition-transform duration-200"
                      >
                        {getStatusIcon(task.status)}
                      </IconButton>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className={`text-lg font-medium ${
                                task.status === TaskStatus.DONE
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              {getStatusChip(task.status)}
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <IconButton
                              onClick={() => {
                                setEditingTask(task);
                                setOpenTaskDialog(true);
                              }}
                              className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => setDeletingTask(task)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <TaskDialog
          open={openTaskDialog}
          onClose={() => {
            setOpenTaskDialog(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          editingTask={editingTask}
        />

        <DeleteTaskDialog
          open={!!deletingTask}
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onConfirm={handleDeleteTask}
        />
      </div>
    </LocalizationProvider>
  );
}
