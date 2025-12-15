import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";
import type { Column } from "../allType";

interface ColumnState {
    columns: {
        [boardId: string]: Column[];
    };
    loading: boolean;
    error: string | null;
}

const initialState: ColumnState = {
    columns: {},
    loading: false,
    error: null,
};

// Add a new column
export const addColumn = createAsyncThunk(
    "column/addColumn",
    async ({ boardId, name }: { boardId: string; name: string }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post(
                `/api/boards/${boardId}/columns/create`,
                { name },
                { withCredentials: true }
            );
            return res.data; // The newly created column
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || error.message);
        }
    }
);

// Fetch columns for a specific board
export const fetchColumn = createAsyncThunk<Column[], string>(
    "column/fetchColumn",
    async (boardId: string, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get(`/api/boards/${boardId}/columns`, { withCredentials: true });
            return res.data; // Array of columns
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const columnSlice = createSlice({
    name: "column",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Add Column
            .addCase(addColumn.fulfilled, (state, action) => {
                const boardId = action.payload.board;
                if (!state.columns[boardId]) state.columns[boardId] = [];
                state.columns[boardId].push(action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(addColumn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addColumn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Columns
            .addCase(fetchColumn.fulfilled, (state, action) => {
                const boardId = action.meta.arg; // boardId is passed as argument
                state.columns[boardId] = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchColumn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColumn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default columnSlice.reducer;
