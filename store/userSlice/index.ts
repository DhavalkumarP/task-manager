import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./types";

const initialState: UserState = {
  token: "",
  userDetails: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<UserState["token"]>) => {
      state.token = action.payload;
    },
    setUserDetails: (
      state,
      action: PayloadAction<UserState["userDetails"]>
    ) => {
      state.userDetails = action.payload;
    },
    setUserSlice: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    resetUserSlice: () => {
      return initialState;
    },
  },
});

export const { setToken, setUserDetails, setUserSlice, resetUserSlice } =
  userSlice.actions;

export default userSlice.reducer;
