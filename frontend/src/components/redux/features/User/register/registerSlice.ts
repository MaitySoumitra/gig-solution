// registerSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../../../api/axiosClient";

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "tutor" | "student" | "institute"; // Added 'institute' for full role coverage
  phone?: string;
  // REMOVED: cookieId?: string; 
}

interface RegisterState {
  user: UserProfile | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  successMessage: string | null;
    redirectTo: string | null,
}

const initialState: RegisterState = {
  user: null,
  loading: 'idle',
  error: null,
  successMessage: null,
  redirectTo: null
};

// Async thunk for registration (No changes needed here as it handles API call)
export const registerUser = createAsyncThunk<
  UserProfile, // return type
  { name: string; email: string; password: string; role: string; phone?: string }, // argument type
  { rejectValue: string }
>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Backend now sends a cookie for auto-login
      const res = await axiosClient.post("http://localhost:5000/api/users/register", userData);
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    clearRegisterState: (state) => {
      state.loading = 'idle';
      state.error = null;
      state.successMessage = null;
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = 'succeeded';
        state.user = action.payload;
        // The success message is the trigger for navigation
        state.successMessage = 'User registered successfully!';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Registration failed';
      });
  }
});

export const { clearRegisterState } = registerSlice.actions;
export default registerSlice.reducer;