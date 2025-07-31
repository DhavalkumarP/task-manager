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
import { useState } from "react";

type DeleteDialogProps = {
  open: boolean;
  project: IProject | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteProjectDialog({
  open,
  project,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ className: "rounded-lg" }}
    >
      <DialogTitle className="text-center pt-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-4">
          <DeleteIcon className="w-8 h-8 text-white" />
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
        <Button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg normal-case"
          disabled={isConfirming}
        >
          Delete Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
