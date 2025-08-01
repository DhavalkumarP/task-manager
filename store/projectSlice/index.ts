import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ProjectState } from "./types";
import { IProject } from "@/types/frontend/IProject";

const initialState: ProjectState = {
  projects: [],
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<IProject[]>) => {
      state.projects = action.payload;
    },
    resetProjectsSlice: () => {
      return initialState;
    },
  },
});

export const { setProjects, resetProjectsSlice } = projectSlice.actions;
export default projectSlice.reducer;
