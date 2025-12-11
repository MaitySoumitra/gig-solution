import { createAsyncThunk, createSlice,  } from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit"
import axiosClient from "../../../api/axiosClient";


interface Board {
    _id: string;
    name: string;
    members: string[];
    columns: string[]
}
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

const boardSlice=createSlice({
    name:"baord",
    initialState:initialBoardState,
    reducers:{},
    extraReducers: (builder)=>{
        builder
        .addCase(createBoard.pending, (state)=>{
            state.loading="pending",
            state.error=null
        })
        .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>)=>{
            state.loading="succeeded"
            state.boards.push(action.payload)
            state.error=null
        } )
        .addCase(createBoard.rejected, (state, action)=>{
            state.loading="failed",
            state.boards=[],
            state.error=(action.payload as string)

        })
    }
})
export default boardSlice.reducer