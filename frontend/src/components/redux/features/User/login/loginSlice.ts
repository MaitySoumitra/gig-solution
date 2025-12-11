import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../../../api/axiosClient";

// --- INTERFACES ---

interface UserProfile {
    name: string;
    email: string;
    role: "super-admin" | "admin" | "Designer" | "Developer" | "Quality Testing" | "Bussiness Analyst"; // ✅ Added missing roles
    lastLogin?: number | null;
}

interface LoginSuccessPayload {
    user: UserProfile;
    redirectTo: string;
    message: string;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: "idle" | "pending" | "successed" | "failed";
    error: string | null;
    redirectTo: string | null;
}

// --- INITIAL STATE ---

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: "idle",
    error: null,
    redirectTo: null,
};

// --- ASYNC THUNK ---

export const loginUsers = createAsyncThunk<
    LoginSuccessPayload, // ✅ Return type
    { email: string; password: string }, // ✅ Argument type
    { rejectValue: string } // ✅ Reject type
>(
  "auth/loginUsers",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/api/users/login",
        { email, password },
        { withCredentials: true } // HttpOnly cookie
      );
      return res.data as LoginSuccessPayload;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



// --- SLICE ---

const loginSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
     setAuthState: (state, action: PayloadAction<UserProfile | null>) => {
    state.user = action.payload;
    state.isAuthenticated = !!action.payload;
    state.loading = 'idle';
    state.error = null;
    state.redirectTo = null;
},


        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = "idle";
            state.error = null;
            state.redirectTo = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUsers.pending, (state) => {
                state.loading = "pending";
                state.error = null;
                state.redirectTo = null;
            })
            .addCase(
                loginUsers.fulfilled,
                (state, action: PayloadAction<LoginSuccessPayload>) => {
                    state.loading = "successed";
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.redirectTo = action.payload.redirectTo;
                    state.error = null;
                }
            )
            .addCase(loginUsers.rejected, (state, action) => {
                state.loading = "failed";
                state.isAuthenticated = false;
                state.user = null;
                state.error = (action.payload as string) || "Login failed";
                state.redirectTo = null;
            });
    },
});

export default loginSlice.reducer;
export const { setAuthState, logout, clearError } = loginSlice.actions;
