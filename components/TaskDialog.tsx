import { TaskStatus } from "@/types/common";
import { ITask } from "@/types/frontend/ITask";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Form, Formik } from "formik";
import * as Yup from "yup";

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

type TaskDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    status: TaskStatus;
    dueDate: Date | null;
  }) => void;
  editingTask: ITask | null;
};

export default function TaskDialog({
  open,
  onClose,
  onSubmit,
  editingTask,
}: TaskDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-lg",
      }}
    >
      <Formik
        initialValues={{
          title: editingTask?.title || "",
          status: editingTask?.status || TaskStatus.TODO,
          dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate) : null,
        }}
        validationSchema={taskSchema}
        onSubmit={onSubmit}
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
            <DialogTitle className="text-xl font-semibold">
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogContent>
              <div className="flex flex-col gap-y-4 pt-4">
                <TextField
                  fullWidth
                  label="Task Title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  variant="outlined"
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
              </div>
            </DialogContent>
            <DialogActions className="p-6">
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
