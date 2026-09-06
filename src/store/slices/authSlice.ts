import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AdminProfile } from "../../types/auth.type";

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  admin: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AdminProfile>) => {
      state.isAuthenticated = true;
      state.admin = action.payload;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<AdminProfile>>) => {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload };
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, updateProfile } = authSlice.actions;
export default authSlice.reducer;
