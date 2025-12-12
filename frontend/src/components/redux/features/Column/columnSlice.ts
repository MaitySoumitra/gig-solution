import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosClient from "../../../api/axiosClient"

interface Column {
    _id: string,
    name: string,
    board: string,
    task: string[]
}
interface BoardState {
    columns: Column[],
    laoding: boolean,
    error: string | null
}
const initialState: BoardState = {
    columns: [],
    laoding: false,
    error: ""
}

export const addColumn = createAsyncThunk("column/addColumn", async ({ boardId, name }: { boardId: string, name: string }, { rejectWithValue }) => {
    try {
        const res = await axiosClient.post(`/api/boards/${boardId}/columns/create`, { name }, {withCredentials: true})
        return res.data
    }
    catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || error.message)
    }

})
export const fetchColumn = createAsyncThunk<Column[], string>("column/fetchColumn", async (boardId: string, { rejectWithValue }) => {
    try {
        const res = await axiosClient.get(`/api/boards/${boardId}`)
        return res.data
    }
    catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message)
    }


})

const columnSLice = createSlice({
    name: "column",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addColumn.fulfilled, (state, action) => {
                state.columns.push(action.payload)
                state.laoding = false
                state.error = null

            })
            .addCase(fetchColumn.fulfilled, (state, action)=>{
                state.laoding=false
                state.columns=action.payload
                state.error=null
            })

    },
})
export default columnSLice.reducer