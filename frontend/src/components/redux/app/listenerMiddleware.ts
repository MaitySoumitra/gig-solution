import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { addMember, createBoard, deleteBoard, editBoard } from "../features/Board/boardSlice";
import { fetchNotifications } from "../features/notifications/notificationSlice";
import { addTask, deleteTask, getTasks, moveTask, updateTask, addComment } from "../features/Task/taskSlice";
import { addColumn, deleteColumn } from "../features/Column/columnSlice";

export const listenerMiddleware=createListenerMiddleware();

listenerMiddleware.startListening({
    matcher:isAnyOf(
        addMember.fulfilled, createBoard.fulfilled, deleteBoard.fulfilled, editBoard.fulfilled,
        addTask.fulfilled, moveTask.fulfilled, updateTask.fulfilled, deleteTask.fulfilled, addComment.fulfilled,
        addColumn.fulfilled, deleteColumn.fulfilled    
    ),
   effect: async (action, listenerApi) => {
    // 1. Update notifications
    listenerApi.dispatch(fetchNotifications());
     console.log("SaaS Sync: Change detected, refreshing data...");

    // 2. If it was a task update, re-fetch tasks to ensure positions are correct
    if (updateTask.fulfilled.match(action)) {
      const boardId = (action.payload as any).board;
      if (boardId) {
        // This runs in the background. The user sees the local update first (instant),
        // then this ensures the data is 100% accurate from the DB.
        listenerApi.dispatch(getTasks({ boardId }));
      }
    }
  },
})