import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, } from "../../../types/allType";
import axiosClient from "../../../api/axiosClient";
import { deleteColumn } from "../Column/columnSlice";

interface taskState {
    task: Task[];
    selectedTask: Task | null;
    loading: "idle" | "pending" | "fulfilled" | "failed",
    error: string | null
}

const initialState: taskState = {
    task: [],
    selectedTask: null,
    loading: 'idle',
    error: null
}
interface GetTasksParams {
    scope?: "mine" | "all";
    boardId?: string;
    columnId?: string;
}
export const getTasks = createAsyncThunk<Task[], GetTasksParams | undefined, { rejectValue: string }>(
    "tasks/getTasks",
    async (params, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();

            if (params?.scope) query.append("scope", params.scope);
            if (params?.boardId) query.append("boardId", params.boardId);
            if (params?.columnId) query.append("columnId", params.columnId);

            const res = await axiosClient.get(`/api/tasks?${query.toString()}`, {
                withCredentials: true,
            });

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
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
export const moveTask = createAsyncThunk<
    Task, // full Task object
    { taskId: string; newColumnId: string; newPosition: number },
    { rejectValue: string }
>(
    "task/moveTask",
    async ({ taskId, newColumnId, newPosition }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.patch(
                `/api/tasks/${taskId}/move`,
                { newColumnId, newPosition },
                { withCredentials: true }
            );
            return res.data; // <-- full Task object
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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

export const addComment = createAsyncThunk<Task, { taskId: string; formData: FormData }, { rejectValue: string }>(
    "tasks/addComment",
    async ({ taskId, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`/api/tasks/${taskId}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const toggleTimer = createAsyncThunk<Task, { taskId: string }, { rejectValue: string }>(
    "task/toggleTimer",
    async ({ taskId }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post(`/api/tasks/${taskId}/timer`, {}, { withCredentials: true });
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const uploadFiles = createAsyncThunk<Task, { taskId: string; formData: FormData }, { rejectValue: string }>("task/uploadfiles",
    async ({ taskId, formData }, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post(`api/tasks/${taskId}/upload`, formData, { headers: { 'Content-Type': 'multipart/formData' }, withCredentials: true })
            return res.data
        }
        catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message)
        }
    }
)

export const deleteFiles = createAsyncThunk("task/deleteFiles", async ({ taskId, fileId }: { taskId: string, fileId: string }, { rejectWithValue }) => {
    try {
        const res = await axiosClient.delete(`/api/tasks/${taskId}/upload/${fileId}`, { withCredentials: true })
        return res.data
    }
    catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})



const taskSlice = createSlice({
    name: "taskSlice",
    initialState,
    reducers: {
        clearTasks: (state) => {
            state.task = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addTask.pending, (state) => { state.loading = "pending"; state.error = null; })
            .addCase(addTask.fulfilled, (state, action) => {
                state.loading = "fulfilled";
                state.task.push(action.payload);
            })
            .addCase(addTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })

            .addCase(moveTask.pending, (state, action) => {
                state.loading = "pending";
                const { taskId, newColumnId, newPosition } = action.meta.arg;
                const taskToMove = state.task.find(t => t._id === taskId);
                if (taskToMove) {
                    taskToMove.column =
                        typeof taskToMove.column === "object"
                            ? { ...taskToMove.column, _id: newColumnId }
                            : newColumnId;

                    taskToMove.position = newPosition;
                }
            })
            .addCase(moveTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.loading = "fulfilled";

                const index = state.task.findIndex(t => t._id === action.payload._id);

                if (index !== -1) {
                    state.task[index] = action.payload; // fully replace with server version
                }

                // Update selectedTask if it's the same task
                if (state.selectedTask?._id === action.payload._id) {
                    state.selectedTask = action.payload;
                }
            })
            .addCase(moveTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })
            .addCase(updateTask.pending, (state) => { state.loading = "pending"; })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = "fulfilled";
                const index = state.task.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.task[index] = {
                        ...state.task[index],
                        ...action.payload,
                        board: action.payload.board ?? state.task[index].board,
                        column: action.payload.column ?? state.task[index].column,
                    };
                }
            })
            .addCase(updateTask.rejected, (state, action) => { state.loading = "failed"; state.error = action.payload as string; })
            .addCase(deleteTask.pending, (state) => { state.loading = "pending"; })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = "fulfilled";
                state.task = state.task.filter(t => t._id !== (action.payload as any).taskId);
            })
            .addCase(deleteTask.rejected, (state) => { state.loading = "failed"; })
            .addCase(addComment.pending, (state) => {
                state.loading = "pending";
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = "fulfilled";

                // Update the task in the main array
                const index = state.task.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.task[index] = {
                        ...state.task[index],
                        ...action.payload,
                    };
                }

                // IMPORTANT: Update selectedTask so the comment appears in the modal instantly
                state.selectedTask = action.payload;
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(toggleTimer.pending, (state) => {
                state.loading = "pending";
            })
            .addCase(toggleTimer.fulfilled, (state, action) => {
                state.loading = "fulfilled";
                const index = state.task.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.task[index] = {
                        ...state.task[index],
                        ...action.payload,
                        board:
                            typeof action.payload.board === "object"
                                ? action.payload.board
                                : state.task[index].board,
                        column:
                            typeof action.payload.column === "object"
                                ? action.payload.column
                                : state.task[index].column,
                    };
                }
            })

            .addCase(toggleTimer.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(deleteColumn.fulfilled, (state, action) => {
                const { columnId } = action.payload;
                state.task = state.task.filter((t) => {
                    const taskColId = typeof t.column === 'object' ? t.column._id : t.column;
                    return taskColId !== columnId;
                });
            })
            .addCase(getTasks.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(getTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.loading = "fulfilled";
                state.task = action.payload;
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(uploadFiles.pending, (state) => {
                state.loading = "pending";
            })
            .addCase(uploadFiles.fulfilled, (state, action) => {
                const index = state.task.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.task[index] = action.payload;
                }
                state.selectedTask = action.payload;
                state.loading = "fulfilled";
            })
            .addCase(uploadFiles.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.payload as string;
            })
            .addCase(deleteFiles.fulfilled, (state, action) => {
                state.selectedTask = action.payload
            })
    }
})
export default taskSlice.reducer
export const { clearTasks } = taskSlice.actions;