"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  Schedule as InProgressIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { ProjectAPI } from "@/services/ProjectAPI";
import { TaskAPI } from "@/services/TaskAPI";
import { TaskStatus } from "@/types/common";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helper";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IProject } from "@/types/frontend/IProject";
import { ITask } from "@/types/frontend/ITask";

const taskSchema = Yup.object({
  title: Yup.string()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title must be less than 200 characters")
    .required("Task title is required"),
  status: Yup.string()
    .oneOf(Object.values(TaskStatus), "Invalid status")
    .required("Status is required"),
  dueDate: Yup.date().nullable(),
});

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return <TodoIcon className="text-gray-500" />;
    case TaskStatus.IN_PROGRESS:
      return <InProgressIcon className="text-blue-500" />;
    case TaskStatus.DONE:
      return <DoneIcon className="text-green-500" />;
  }
};

const getStatusChip = (status: TaskStatus) => {
  const statusConfig = {
    [TaskStatus.TODO]: {
      label: "To Do",
      className: "bg-gray-100 text-gray-700 font-medium",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700 font-medium",
    },
    [TaskStatus.DONE]: {
      label: "Done",
      className: "bg-green-100 text-green-700 font-medium",
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

  const [project, setProject] = useState<IProject | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [deletingTask, setDeletingTask] = useState<ITask | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">(
    "all"
  );

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectResponse, tasksResponse] = await Promise.all([
        ProjectAPI.getProject(projectId),
        TaskAPI.getTasks(projectId),
      ]);

      if (projectResponse.success) {
        setProject(projectResponse.data);
      }
      if (tasksResponse.success) {
        setTasks(tasksResponse.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      // router.push("/dashboard");
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
        toast.success("Task created successfully");
        setOpenTaskDialog(false);
        fetchProjectAndTasks();
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
        toast.success("Task updated successfully");
        setOpenTaskDialog(false);
        setEditingTask(null);
        fetchProjectAndTasks();
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
        toast.success("Task deleted successfully");
        setDeletingTask(null);
        fetchProjectAndTasks();
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
        fetchProjectAndTasks();
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

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress className="text-blue-600" size={48} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to Projects
        </Button>

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
                {project?.name}
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                {project?.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingTask(null);
                setOpenTaskDialog(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium px-6 py-2.5"
            >
              Add Task
            </Button>
          </Box>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              className={`group text-center cursor-pointer backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                selectedStatus === "all" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedStatus("all")}
            >
              <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <Typography
                  variant="h3"
                  className="font-bold text-gray-800 mb-2"
                >
                  {tasks.length}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Total Tasks
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              className={`group text-center cursor-pointer backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                selectedStatus === TaskStatus.TODO ? "ring-2 ring-gray-500" : ""
              }`}
              onClick={() => setSelectedStatus(TaskStatus.TODO)}
            >
              <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <Typography
                  variant="h3"
                  className="font-bold text-gray-600 mb-2"
                >
                  {tasksByStatus[TaskStatus.TODO].length}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  To Do
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              className={`group text-center cursor-pointer backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                selectedStatus === TaskStatus.IN_PROGRESS
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => setSelectedStatus(TaskStatus.IN_PROGRESS)}
            >
              <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <Typography
                  variant="h3"
                  className="font-bold text-blue-600 mb-2"
                >
                  {tasksByStatus[TaskStatus.IN_PROGRESS].length}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  In Progress
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              className={`group text-center cursor-pointer backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                selectedStatus === TaskStatus.DONE
                  ? "ring-2 ring-green-500"
                  : ""
              }`}
              onClick={() => setSelectedStatus(TaskStatus.DONE)}
            >
              <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <Typography
                  variant="h3"
                  className="font-bold text-green-600 mb-2"
                >
                  {tasksByStatus[TaskStatus.DONE].length}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium"
                >
                  Done
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter */}
        <Box className="mb-6">
          <FormControl size="medium" className="min-w-[250px]">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as TaskStatus | "all")
              }
              label="Filter by Status"
              className="bg-white/90 backdrop-blur-sm rounded-lg"
            >
              <MenuItem value="all">All Tasks</MenuItem>
              <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Paper
            elevation={0}
            className="text-center py-16 backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl"
          >
            <Box className="flex flex-col items-center">
              <Box className="flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                <InProgressIcon className="text-5xl text-gray-400" />
              </Box>
              <Typography variant="h5" className="font-bold text-gray-800 mb-2">
                No tasks found
              </Typography>
              <Typography
                variant="body1"
                className="text-gray-600 mb-6 max-w-sm"
              >
                {selectedStatus === "all"
                  ? "Create your first task to get started with this project"
                  : `No tasks with status "${selectedStatus}"`}
              </Typography>
              {selectedStatus === "all" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenTaskDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium"
                >
                  Create Your First Task
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl overflow-hidden"
          >
            <List className="p-0">
              {filteredTasks.map((task, index) => (
                <Box key={task.id}>
                  {index > 0 && <Divider className="bg-gray-100" />}
                  <ListItem className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 py-4 px-6">
                    <Box className="flex items-center mr-4">
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
                    </Box>
                    <ListItemText
                      primary={
                        <Typography
                          className={`font-medium text-lg ${
                            task.status === TaskStatus.DONE
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box className="flex items-center gap-3 mt-2">
                          {getStatusChip(task.status)}
                          {task.dueDate && (
                            <Box className="flex items-center gap-1 text-gray-500">
                              <CalendarIcon className="text-sm" />
                              <Typography
                                variant="caption"
                                className="font-medium"
                              >
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingTask(task);
                          setOpenTaskDialog(true);
                        }}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => setDeletingTask(task)}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ml-1"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        )}

        {/* Create/Edit Task Dialog */}
        <Dialog
          open={openTaskDialog}
          onClose={() => {
            setOpenTaskDialog(false);
            setEditingTask(null);
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
              title: editingTask?.title || "",
              status: editingTask?.status || TaskStatus.TODO,
              dueDate: editingTask?.dueDate
                ? new Date(editingTask.dueDate)
                : null,
            }}
            validationSchema={taskSchema}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form>
                <DialogTitle className="text-center pb-0">
                  <Box className="flex flex-row gap-2 items-center">
                    <Box className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                      <AddIcon className="text-3xl text-blue-600" />
                    </Box>
                    <Typography
                      variant="h5"
                      className="font-bold text-gray-800"
                    >
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Box className="flex flex-col gap-y-4 mt-4">
                    <TextField
                      fullWidth
                      label="Task Title"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      className="bg-gray-50"
                      slotProps={{
                        input: { className: "rounded-lg" },
                      }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Status"
                      >
                        <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                        <MenuItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </MenuItem>
                        <MenuItem value={TaskStatus.DONE}>Done</MenuItem>
                      </Select>
                    </FormControl>
                    <DatePicker
                      label="Due Date (Optional)"
                      value={values.dueDate}
                      onChange={(date) => setFieldValue("dueDate", date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.dueDate && Boolean(errors.dueDate),
                          helperText: touched.dueDate && errors.dueDate,
                        },
                      }}
                    />
                  </Box>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                  <Button
                    onClick={() => {
                      setOpenTaskDialog(false);
                      setEditingTask(null);
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
                    ) : editingTask ? (
                      "Update Task"
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        {/* Delete Task Confirmation Dialog */}
        <Dialog
          open={!!deletingTask}
          onClose={() => setDeletingTask(null)}
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
                Delete Task
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent className="text-center">
            <Typography className="text-gray-600">
              Are you sure you want to delete
            </Typography>
            <Typography className="font-semibold text-gray-800 my-2">
              &quot;{deletingTask?.title}&quot;?
            </Typography>
            <Typography variant="body2" className="text-gray-500 mt-4">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions className="p-6 pt-2 justify-center gap-3">
            <Button
              onClick={() => setDeletingTask(null)}
              className="text-gray-600 hover:text-gray-800 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTask}
              variant="contained"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case font-medium"
            >
              Delete Task
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
