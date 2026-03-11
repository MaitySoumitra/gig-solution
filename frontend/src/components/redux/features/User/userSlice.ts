import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

interface UserState {
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  loading: false,
  error: null
};

/* DELETE USER */

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/users/delete/${id}`, {
        withCredentials: true
      });

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

/* UPDATE USER */

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/api/users/update/${id}`, data, {
        withCredentials: true
      });

      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(deleteUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(updateUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userSlice.reducer;