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
}
)

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

                // 1. Find the task
                const taskToMove = state.task.find(t => t._id === taskId);
                if (taskToMove) {
                    // 2. Update its column
                    taskToMove.column = newColumnId;
                    // 3. Update its position
                    taskToMove.position = newPosition;

                    // 4. Update positions of other tasks in the same column
                    state.task.forEach(t => {
                        if (t.column === newColumnId && t._id !== taskId) {
                            if (t.position >= newPosition) {
                                t.position += 1; // Shift others down
                            }
                             
                        }
                    });
                }
            })
            .addCase(moveTask.fulfilled, (state) => {
                state.loading = "fulfilled";
                // No need to do anything here if handled in pending
            })
            .addCase(moveTask.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
                // Note: If it fails, you might need to "Rollback" the column ID here
            })
    }
})
export default taskSlice.reducer