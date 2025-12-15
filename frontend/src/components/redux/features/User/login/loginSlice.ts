import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../../../api/axiosClient";
import type { User } from "../../../../types/allType";

interface LoginSuccessPayload {
    user: User;
    redirectTo: string;
    message: string;
}

interface AuthState {
    user: User | null;
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

export const loginUsers = createAsyncThunk<
    LoginSuccessPayload,
    { email: string; password: string }, 
    { rejectValue: string }
>(
    "auth/loginUsers",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post(
                "/api/users/login",
                { email, password },
                { withCredentials: true } 
            );
            return res.data as LoginSuccessPayload;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


const loginSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setAuthState: (state, action: PayloadAction<User | null>) => {
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
