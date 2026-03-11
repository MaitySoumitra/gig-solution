import { configureStore } from '@reduxjs/toolkit';
import loginUsers from '../features/User/login/loginSlice';
import registerUser from '../features/User/register/registerSlice'
import boardSlice from "../features/Board/boardSlice"
import cloumnSlice from '../features/Column/columnSlice'
import taskSlice from '../features/Task/taskSlice'
import notificationSlice from '../features/notifications/notificationSlice';
import chatReducer from "../features/chat/chatSlice";
import uiReducer from '../features/ui/loadingSlice';
import userReducer from '../features/User/userSlice';
import { chatApi } from "../features/chat/chatApi";
import { listenerMiddleware } from './listenerMiddleware';
export const store = configureStore({
    reducer: {
        ui: uiReducer,
        login: loginUsers,
        register: registerUser,
        board: boardSlice,
        column: cloumnSlice,
        task: taskSlice,
        notification: notificationSlice,
        chat: chatReducer,
        user: userReducer,
        [chatApi.reducerPath]: chatApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(chatApi.middleware)
    .prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
