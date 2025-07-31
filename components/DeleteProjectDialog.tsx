"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { IProject } from "@/types/frontend/IProject";

type DeleteDialogProps = {
  open: boolean;
  project: IProject | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteProjectDialog({
  open,
  project,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ className: "rounded-lg" }}
    >
      <DialogTitle className="text-center pt-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <DeleteIcon className="w-8 h-8 text-red-600" />
        </div>
        <Typography variant="h6" className="font-semibold">
          Delete Project
        </Typography>
      </DialogTitle>
      <DialogContent className="text-center pb-6">
        <Typography className="text-gray-600">
          Are you sure you want to delete
        </Typography>
        <Typography className="font-semibold text-gray-900 my-2">
          &quot;{project?.name}&quot;?
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-4">
          This action cannot be undone. All tasks associated with this project
          will also be deleted.
        </Typography>
      </DialogContent>
      <DialogActions className="p-6 pt-0 justify-center gap-3">
        <Button onClick={onClose} className="text-gray-600">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          className="bg-red-600 hover:bg-red-700"
        >
          Delete Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
