"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
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

type ProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; description: string }) => void;
  editingProject: IProject | null;
};

export default function ProjectDialog({
  open,
  onClose,
  onSubmit,
  editingProject,
}: ProjectDialogProps) {
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
          name: editingProject?.name || "",
          description: editingProject?.description || "",
        }}
        validationSchema={projectSchema}
        onSubmit={onSubmit}
        enableReinitialize
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
            <DialogTitle className="text-xl font-semibold">
              {editingProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogContent>
              <div className="flex flex-col gap-y-4 pt-4">
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
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
              </div>
            </DialogContent>
            <DialogActions className="p-6">
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
