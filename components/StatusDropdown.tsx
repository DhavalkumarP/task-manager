"use client";

import { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import {
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  Schedule as InProgressIcon,
} from "@mui/icons-material";
import { TaskStatus } from "@/types/common";

interface StatusDropdownProps {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => Promise<void>;
  disabled?: boolean;
}

const statusOptions = [
  {
    value: TaskStatus.TODO,
    label: "To Do",
    icon: <TodoIcon className="w-4 h-4" />,
    className: "text-gray-600",
    bgClassName: "bg-gray-50 hover:bg-gray-100",
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: "In Progress",
    icon: <InProgressIcon className="w-4 h-4" />,
    className: "text-indigo-600",
    bgClassName: "bg-indigo-50 hover:bg-indigo-100",
  },
  {
    value: TaskStatus.DONE,
    label: "Done",
    icon: <DoneIcon className="w-4 h-4" />,
    className: "text-green-600",
    bgClassName: "bg-green-50 hover:bg-green-100",
  },
];

export default function StatusDropdown({
  status,
  onStatusChange,
  disabled = false,
}: StatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleChange = async (event: SelectChangeEvent<TaskStatus>) => {
    const newStatus = event.target.value as TaskStatus;
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      setCurrentStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = statusOptions.find(
    (opt) => opt.value === currentStatus
  );

  return (
    <FormControl size="small" disabled={disabled || isUpdating}>
      <Select
        value={currentStatus}
        onChange={handleChange}
        displayEmpty
        className={`min-w-[140px] ${currentOption?.bgClassName} ${currentOption?.className} rounded-lg`}
        MenuProps={{
          PaperProps: {
            className: "mt-2 rounded-lg shadow-lg",
          },
        }}
        startAdornment={
          isUpdating ? <CircularProgress size={16} className="mr-2" /> : null
        }
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            className={`${option.bgClassName} ${option.className} rounded mx-1 my-0.5`}
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
