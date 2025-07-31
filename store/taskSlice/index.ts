import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ITask } from "@/types/frontend/ITask";
import { TaskState } from "./types";

const initialState: TaskState = {
  tasks: {},
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (
      state,
      action: PayloadAction<{ projectId: string; tasks: ITask[] }>
    ) => {
      const { projectId, tasks } = action.payload;
      state.tasks[projectId] = tasks;
    },
    resetTaskSlice: () => {
      return initialState;
    },
  },
});

export const { setTasks, resetTaskSlice } = taskSlice.actions;
export default taskSlice.reducer;
