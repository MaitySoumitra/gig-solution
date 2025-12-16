import { configureStore } from '@reduxjs/toolkit';
import  loginUsers  from '../features/User/login/loginSlice';
import registerUser from '../features/User/register/registerSlice'
import boardSlice from "../features/Board/boardSlice"
import cloumnSlice from '../features/Column/columnSlice'
import taskSlice from '../features/Task/taskSlice'
export const store = configureStore({
    reducer: {
       login:loginUsers,
    register: registerUser,
    board: boardSlice,
    column: cloumnSlice,
    task:taskSlice,
    }
})

export type RootState=ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch
