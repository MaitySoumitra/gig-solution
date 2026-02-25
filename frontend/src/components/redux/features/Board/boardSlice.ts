import { createAsyncThunk, createSlice, } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"
import axiosClient from "../../../api/axiosClient";
import type { Board } from "../../../types/allType";

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
export const fetchBoardById = createAsyncThunk<Board, string, { rejectValue: string }>(
    "board/fetchBoardById",
    async (boardId, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get(`/api/boards/${boardId}`);
            return res.data as Board;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteBoard=createAsyncThunk("board/deleteBoard", async({boardId}:{boardId: string}, {rejectWithValue})=>{
    try{
        await axiosClient.delete(`/api/boards/${boardId}`, {withCredentials: true})
        return {boardId}
    }
    catch(error: any){
        return rejectWithValue( error.response?.message?.data || error.message)

    }
})

export const editBoard=createAsyncThunk< Board,{boardId: string, name: string}, {rejectValue: string}>("board/editBoard",
    async({boardId, name},{rejectWithValue})=>{
        try{
            const res=await axiosClient.put(`/api/boards/${boardId}`, {name}, {withCredentials: true})
            return res.data as Board
        }
        catch(error: any){
        return rejectWithValue( error.response?.message?.data || error.message)

    }
    }
)

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
                   
                    state.error = action.payload as string
            })
            // boardSlice.ts extraReducers section
            .addCase(addMember.pending, (state) => {
                state.loading = "pending";
            })
            .addCase(addMember.fulfilled, (state, action: PayloadAction<Board>) => {
                state.loading = "succeeded"; // MUST reset loading here
                state.boards = state.boards.map(board =>
                    board._id === action.payload._id ? action.payload : board
                );
                state.error = null;
            })
            .addCase(addMember.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(fetchBoardById.fulfilled, (state, action: PayloadAction<Board>) => {
                state.loading = "succeeded";
                // Update the specific board in the list with its full details
                const index = state.boards.findIndex(b => b._id === action.payload._id);
                if (index !== -1) {
                    state.boards[index] = action.payload;
                } else {
                    state.boards.push(action.payload);
                }
            })
            .addCase(deleteBoard.pending,(state)=>{
                state.loading="pending"
            })
            .addCase(deleteBoard.fulfilled,(state, action)=>{
                state.loading="succeeded"
                state.boards=state.boards.filter(board=>board._id!==action.payload.boardId)
            })
            .addCase(deleteBoard.rejected, (state, action)=>{
                state.loading="failed"
                state.error=action.payload as string
            })
            .addCase(editBoard.fulfilled, (state,action)=>{
                state.loading="succeeded"
                const index=state.boards.findIndex(b=>b._id===action.payload._id)
                if(index===-1){
                    state.boards[index]=action.payload
                }
            })
            

    }
})
export default boardSlice.reducer