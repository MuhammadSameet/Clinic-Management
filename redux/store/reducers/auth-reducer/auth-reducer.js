// Auth reducer slices are defined here...!

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  usersList: []
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    AUTH_LOADING: (state) => {
      state.loading = true;
      state.error = null;
    },
    AUTH_SUCCESS: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.error = null;
    },
    AUTH_ERROR: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    AUTH_LOGOUT: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },
    UPDATE_AUTH_STATE: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { AUTH_LOADING, AUTH_SUCCESS, AUTH_ERROR, AUTH_LOGOUT, UPDATE_AUTH_STATE } = authSlice.actions;
export default authSlice.reducer;
