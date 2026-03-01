// Auth reducer slices are defined here...!

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  usersList: [],
  authChecked: false, // true after first checkAuthState run (avoid redirect before Firebase restores session)
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
    },
    AUTH_CHECKED: (state) => {
      state.authChecked = true;
    }
  },
  // Handle plain action types (without "auth/" prefix) from login/signup/checkAuthState
  extraReducers: (builder) => {
    builder
      .addCase('AUTH_SUCCESS', (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase('AUTH_LOGOUT', (state) => {
        state.isAuthenticated = false;
        state.currentUser = null;
      })
      .addCase('UPDATE_AUTH_STATE', (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase('AUTH_ERROR', (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('AUTH_LOADING', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('AUTH_CHECKED', (state) => {
        state.authChecked = true;
      });
  }
});

export const { AUTH_LOADING, AUTH_SUCCESS, AUTH_ERROR, AUTH_LOGOUT, UPDATE_AUTH_STATE, AUTH_CHECKED } = authSlice.actions;
export default authSlice.reducer;
