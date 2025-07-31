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
      className: "bg-gray-100 text-gray-700",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700",
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
  console.log("Project ID:", projectId);

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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box className="mb-6">
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-gray-600"
          >
            Back to Projects
          </Button>

          <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Box>
              <Typography variant="h4" className="font-bold text-gray-800">
                {project?.name}
              </Typography>
              <Typography variant="body1" className="text-gray-600 mt-1">
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
              className="bg-blue-600 hover:bg-blue-700 normal-case"
            >
              Add Task
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={6} sm={3}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus("all")}
            >
              <CardContent>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {tasks.length}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Total Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus(TaskStatus.TODO)}
            >
              <CardContent>
                <Typography variant="h4" className="font-bold text-gray-600">
                  {tasksByStatus[TaskStatus.TODO].length}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  To Do
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus(TaskStatus.IN_PROGRESS)}
            >
              <CardContent>
                <Typography variant="h4" className="font-bold text-blue-600">
                  {tasksByStatus[TaskStatus.IN_PROGRESS].length}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStatus(TaskStatus.DONE)}
            >
              <CardContent>
                <Typography variant="h4" className="font-bold text-green-600">
                  {tasksByStatus[TaskStatus.DONE].length}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Done
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter */}
        <Box className="mb-4">
          <FormControl size="small" className="min-w-[200px]">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as TaskStatus | "all")
              }
              label="Filter by Status"
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
          <Card className="text-center py-12">
            <CardContent>
              <Typography variant="h6" className="text-gray-600 mb-2">
                No tasks found
              </Typography>
              <Typography variant="body2" className="text-gray-500 mb-4">
                {selectedStatus === "all"
                  ? "Create your first task to get started"
                  : `No tasks with status "${selectedStatus}"`}
              </Typography>
              {selectedStatus === "all" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenTaskDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 normal-case"
                >
                  Create Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Paper elevation={0} className="border border-gray-200">
            <List className="p-0">
              {filteredTasks.map((task, index) => (
                <Box key={task.id}>
                  {index > 0 && <Divider />}
                  <ListItem className="hover:bg-gray-50 py-4">
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
                      >
                        {getStatusIcon(task.status)}
                      </IconButton>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography
                          className={`${
                            task.status === TaskStatus.DONE
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box className="flex items-center gap-2 mt-1">
                          {getStatusChip(task.status)}
                          {task.dueDate && (
                            <Box className="flex items-center gap-1 text-gray-500">
                              <CalendarIcon fontSize="small" />
                              <Typography variant="caption">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingTask(task);
                          setOpenTaskDialog(true);
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => setDeletingTask(task)}
                        className="text-gray-600 hover:text-red-600 ml-1"
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
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogContent>
                  <Box className="space-y-4 mt-2">
                    <TextField
                      fullWidth
                      label="Task Title"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      autoFocus
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
                <DialogActions>
                  <Button
                    onClick={() => {
                      setOpenTaskDialog(false);
                      setEditingTask(null);
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
                    ) : editingTask ? (
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

        {/* Delete Task Confirmation Dialog */}
        <Dialog
          open={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deletingTask?.title}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeletingTask(null)}>Cancel</Button>
            <Button
              onClick={handleDeleteTask}
              variant="contained"
              color="error"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
