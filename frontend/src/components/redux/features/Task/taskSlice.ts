import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../../../types/allType";
import axiosClient from "../../../api/axiosClient";

interface taskState {
    task: Task[];
    loading: "idle" | "pending" | "fulfilled" | "failed",
    error: string | null
}

const initialState: taskState = {
    task: [],
    loading: 'idle',
    error: null
}
export const fetchTasksForColumn = createAsyncThunk<
    Task[],
    { boardId: string; columnId: string },
    { rejectValue: string }
>(
    "tasks/fetchTasksForColumn",
    async ({ boardId, columnId }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get(`/api/boards/${boardId}/columns/${columnId}`, {
                withCredentials: true,
            });
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addTask = createAsyncThunk<Task, { boardId: string, columnId: string, taskData: Partial<Task> }, { rejectValue: string }>("tasks/addTask", async ({ boardId, columnId, taskData }, { rejectWithValue }) => {
    try {
        const res = await axiosClient.post(`/api/boards/${boardId}/columns/${columnId}/tasks`, taskData, { withCredentials: true })
        return res.data
    }
    catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message)
    }
})

export const moveTask = createAsyncThunk<{ taskId: string, newColumnId: string, newPosition: number }, { taskId: string, newColumnId: string, newPosition: number }, { rejectValue: string }>("task/moveTask", async ({ taskId, newColumnId, newPosition }, { rejectWithValue }) => {
    try {
        await axiosClient.patch(`/api/tasks/${taskId}/move`, { newColumnId, newPosition }, { withCredentials: true })
        return { taskId, newColumnId, newPosition }
    }
    catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message)
    }
})

export const updateTask=createAsyncThunk<Task, {taskId: string, update:Partial<Task>}, {rejectValue: string}>( "task/updateTask", async({taskId, update},{rejectWithValue})=>{
    try{
       const res= await axiosClient.patch(`/api/tasks/${taskId}`,  update, {withCredentials: true})
        return res.data
    }
    catch(error: any){
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

export const deleteTask=createAsyncThunk("task/deleteColumn", async({taskId}:{taskId:string}, {rejectWithValue})=>{
    try{
        await axiosClient.delete(`/api/tasks/${taskId}`, {withCredentials: true})
        return {taskId}
    }
    catch(error: any){
        return rejectWithValue(error.response?.data?.message | error.message)
    }
})

const taskSlice = createSlice({
    name: "taskSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksForColumn.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(fetchTasksForColumn.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.loading = "fulfilled";
                // Replace tasks for this column
                action.payload.forEach(task => {
                    const index = state.task.findIndex(t => t._id === task._id);
                    if (index >= 0) state.task[index] = task;
                    else state.task.push(task);
                });
                state.error = null;
            })
            .addCase(fetchTasksForColumn.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(addTask.pending, (state) => {
                state.loading = "pending",
                    state.error = "null"
            })
            .addCase(addTask.fulfilled, (state, actions: PayloadAction<Task>) => {
                state.loading = "fulfilled",
                    state.task.push(actions.payload),
                    state.error = null
            })
            .addCase(addTask.rejected, (state, action) => {
                state.loading = "failed",
                    state.error = action.payload as string
            })
            // taskSlice.ts

            .addCase(moveTask.pending, (state, action) => {
                const { taskId, newColumnId, newPosition } = action.meta.arg;
                const taskToMove = state.task.find(t => t._id === taskId);
                if (taskToMove) {
                    taskToMove.column = newColumnId;
                    taskToMove.position = newPosition;

                    state.task.forEach(t => {
                        if (t.column === newColumnId && t._id !== taskId) {
                            if (t.position >= newPosition) {
                                t.position += 1; 
                            }  
                        }
                    });
                }
            })
            .addCase(moveTask.fulfilled, (state) => {
                state.loading = "fulfilled";
            })
            .addCase(moveTask.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })

            .addCase(updateTask.fulfilled, (state, action)=>{
                const index=state.task.findIndex(t=> t._id===action.payload._id)
                if(index !==-1){
                    state.task[index]=action.payload
                }

            })
            .addCase(deleteTask.pending, (state)=>{
                state.loading="pending";
                state.error= null
            })
            .addCase(deleteTask.fulfilled, (state, action)=>{
                state.loading="fulfilled";
                const {taskId}=action.payload;
                    state.task.filter(t=>
                        t._id !== taskId)
                state.error=null
            })
            .addCase(deleteTask.rejected, (state)=>{
                state.loading="failed"
            })
    }
})
export default taskSlice.reducer