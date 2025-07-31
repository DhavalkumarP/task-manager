import * as Yup from "yup";
import { TaskStatus } from "@/types/common";

export const createTaskValidationSchema = Yup.object({
  title: Yup.string()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title must be less than 200 characters")
    .required("Task title is required"),
  status: Yup.string()
    .oneOf(Object.values(TaskStatus), "Invalid status")
    .optional(),
  dueDate: Yup.string().optional().nullable(),
});

export const updateTaskValidationSchema = Yup.object({
  title: Yup.string()
    .min(2, "Task title must be at least 2 characters")
    .max(200, "Task title must be less than 200 characters")
    .optional(),
  status: Yup.string()
    .oneOf(Object.values(TaskStatus), "Invalid status")
    .optional(),
  dueDate: Yup.string().optional().nullable(),
});
