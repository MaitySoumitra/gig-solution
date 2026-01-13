import { createAsyncThunk, createSlice, isRejectedWithValue, type PayloadAction } from "@reduxjs/toolkit";
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

export const updateTask = createAsyncThunk<Task, { taskId: string, update: Partial<Task> }, { rejectValue: string }>("task/updateTask", async ({ taskId, update }, { rejectWithValue }) => {
    try {
        const res = await axiosClient.patch(`/api/tasks/${taskId}`, update, { withCredentials: true })
        return res.data
    }
    catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

export const deleteTask = createAsyncThunk("task/deleteColumn", async ({ taskId }: { taskId: string }, { rejectWithValue }) => {
    try {
        await axiosClient.delete(`/api/tasks/${taskId}`, { withCredentials: true })
        return { taskId }
    }
    catch (error: any) {
        return rejectWithValue(error.response?.data?.message | error.message)
    }
})

export const updateProgress=createAsyncThunk<Task, {taskId: string, progress:number}, {rejectValue: string}>("task/updateProgress", async({taskId, progress}, {rejectWithValue})=>{
    try{
        const res= await axiosClient.patch(`api/tasks/${taskId}/progress`, {progress}, {withCredentials: true})
        return res.data
    }
    catch(err: any){
        return rejectWithValue(err.response?.data?.message || err.message)
    }
})

export const addComment = createAsyncThunk(
    "tasks/addComment",
    async ({ taskId, text }: { taskId: string; text: string }) => {
        const response = await axiosClient.post(`/api/tasks/${taskId}/comments`, { text });
        return response.data; // This should be the updated task from the backend
    }
);
        // 1. Add this Thunk
export const fetchAllTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
    "tasks/fetchAllTasks",
    async (_, { rejectWithValue }) => {
        try {
            // Adjust this URL to your actual 'get all tasks' endpoint
            const res = await axiosClient.get(`/api/tasks`, { withCredentials: true });
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const taskSlice = createSlice({
    name: "taskSlice",
    initialState,
    reducers: {
    clearTasks: (state) => {
      state.task = []; // Clears the array when switching boards
    }
  },
   extraReducers: (builder) => {
    builder
        // Fetch
        .addCase(fetchTasksForColumn.pending, (state) => { state.loading = "pending"; state.error = null; })
        .addCase(fetchTasksForColumn.fulfilled, (state, action) => {
            state.loading = "fulfilled";
            action.payload.forEach(task => {
                const index = state.task.findIndex(t => t._id === task._id);
                if (index >= 0) state.task[index] = task;
                else state.task.push(task);
            });
        })
        .addCase(fetchTasksForColumn.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })

        // Add
        .addCase(addTask.pending, (state) => { state.loading = "pending"; state.error = null; })
        .addCase(addTask.fulfilled, (state, action) => {
            state.loading = "fulfilled";
            state.task.push(action.payload);
        })
        .addCase(addTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })
        .addCase(moveTask.pending, (state, action) => {
            state.loading = "pending"; // Start loading for move
            const { taskId, newColumnId, newPosition } = action.meta.arg;
            const taskToMove = state.task.find(t => t._id === taskId);
            if (taskToMove) {
                taskToMove.column = newColumnId;
                taskToMove.position = newPosition;
                state.task.forEach(t => {
                    if (t.column === newColumnId && t._id !== taskId) {
                        if (t.position >= newPosition) t.position += 1;
                    }
                });
            }
        })
        .addCase(moveTask.fulfilled, (state) => { state.loading = "fulfilled"; })
        .addCase(moveTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })
        .addCase(updateTask.pending, (state) => { state.loading = "pending"; })
        .addCase(updateTask.fulfilled, (state, action) => {
            state.loading = "fulfilled"; // MUST reset loading here
            const index = state.task.findIndex(t => t._id === action.payload._id);
            if (index !== -1) state.task[index] = action.payload;
        })
        .addCase(updateTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })
        .addCase(deleteTask.pending, (state) => { state.loading = "pending"; })
        .addCase(deleteTask.fulfilled, (state, action) => {
            state.loading = "fulfilled"; // MUST reset loading here
            state.task = state.task.filter(t => t._id !== (action.payload as any).taskId);
        })
        .addCase(deleteTask.rejected, (state) => { state.loading = "failed"; })
        .addCase(addComment.pending, (state) => { state.loading = "pending"; })
        .addCase(addComment.fulfilled, (state, action) => {
            state.loading = "fulfilled"; // MUST reset loading here
            const index = state.task.findIndex(t => t._id === action.payload._id);
            if (index !== -1) state.task[index] = action.payload;
        })
        .addCase(addComment.rejected, (state) => { state.loading = "failed"; })
        .addCase(updateProgress.pending, (state)=>{state.loading="pending"})
        .addCase(updateProgress.fulfilled, (state, action)=>{
            state.loading="fulfilled"
            const index=state.task.findIndex(t=> t._id===action.payload._id)
            if(index !==-1){
                state.task[index]=action.payload

            }
        })
        .addCase(updateProgress.rejected, (state, action)=>{
            state.loading="failed"
            state.error=action.payload as string
        })
        .addCase(fetchAllTasks.fulfilled, (state, action) => {
    state.loading = "fulfilled";
    // This checks if payload is an array; if not, it looks for a .tasks or .data property
    const incomingTasks = Array.isArray(action.payload) 
        ? action.payload 
        : (action.payload as any).tasks || (action.payload as any).data || [];
    
    state.task = incomingTasks; 
})
}
})
export default taskSlice.reducer
export const { clearTasks } = taskSlice.actions;