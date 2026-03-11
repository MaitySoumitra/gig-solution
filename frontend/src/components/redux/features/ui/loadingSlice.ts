import { createSlice, type AnyAction } from "@reduxjs/toolkit";

const loadingSlice=createSlice({
    name: "loadingSlice",
    initialState: {activeRequests: 0},
    reducers:{},
    extraReducers: (builder)=>{
        builder
        .addMatcher(
            (action:AnyAction)=>action.type.endsWith("/loading"),
            (state)=>{state.activeRequests+=1}
        )
        .addMatcher(
            (action:AnyAction)=>action.type.endsWith("/fullfilled") || action.type.endsWith("/rejected"),
            (state)=>{state.activeRequests=Math.max(0, state.activeRequests-1)}
        )
    }
})
export default loadingSlice.reducer