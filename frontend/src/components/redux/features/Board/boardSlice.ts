import { createAsyncThunk, createSlice, } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"
import axiosClient from "../../../api/axiosClient";
import type { Board } from "../allType";

interface CreateBoardArgs {
    name: string;
    members: string[];
}

interface BoardState {
    boards: Board[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialBoardState: BoardState = {
    boards: [],
    loading: 'idle',
    error: ''
}

export const createBoard = createAsyncThunk<
    Board,
    CreateBoardArgs,
    { rejectValue: string }

>("board/createBoard", async (boardData, { rejectWithValue }) => {
    try {
        const res = await axiosClient.post("/api/boards", boardData)
        return res.data as Board
    }
    catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message)
    }
})

export const fetchBoard = createAsyncThunk<Board[], void, { rejectValue: string }>("board/fetchBoard",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get('/api/boards')
            return res.data as Board[]
        }
        catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message)
        }

    })

export const addMember = createAsyncThunk<Board, { boardId: string, memberId: string }, { rejectValue: string }>(
    "board/addMember",
    async ({ boardId, memberId }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.patch(`/api/boards/${boardId}/add-member`, { memberId });
            return res.data as Board;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const boardSlice = createSlice({
    name: "baord",
    initialState: initialBoardState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBoard.pending, (state) => {
                state.loading = "pending",
                    state.error = null
            })
            .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
                state.loading = "succeeded"
                state.boards.push(action.payload)
                state.error = null
            })
            .addCase(createBoard.rejected, (state, action) => {
                state.loading = "failed",
                    state.boards = [],
                    state.error = (action.payload as string)

            })
            .addCase(fetchBoard.pending, (state) => {
                state.loading = "pending",
                    state.error = null
            })
            .addCase(fetchBoard.fulfilled, (state, action: PayloadAction<Board[]>) => {
                state.loading = "succeeded",
                    state.boards = action.payload,
                    state.error = null
            })
            .addCase(fetchBoard.rejected, (state, action) => {
                state.loading = "failed",
                    state.boards = [],
                    state.error = action.payload as string
            })
            .addCase(addMember.fulfilled, (state, action: PayloadAction<Board>) => {
    state.boards = state.boards.map(board =>
        board._id === action.payload._id ? action.payload : board
    );
    state.error = null;
});

    }
})
export default boardSlice.reducer