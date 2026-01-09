import { type  ReactNode, useEffect, useMemo } from "react"
import { BoardContext } from "./BoardContext"
import { useAppDispatch, useAppSelector } from "../../redux/app/hook"
import { useParams } from "react-router-dom"
import { slugify } from "../../hooks/slugify"
import { addMember, fetchBoard } from "../../redux/features/Board/boardSlice"
import type { Board, Task } from "../../types/allType"
import { addColumn, deleteColumn } from "../../redux/features/Column/columnSlice"
import { addComment, deleteTask, moveTask, updateTask } from "../../redux/features/Task/taskSlice"

interface BoardProviderProps{
  board: Board | null
  loading: boolean
  addMember: (memberId: string)=> void
  addColumn: (name: string)=>void
  deleteColumn: (columnId:string)=> void
  deleteTask: (taskId:string)=>void
  updateTask: (taskId:string, updates:Partial<Task>)=>void
  moveTask: (taskId:string, toColumnId:string, toPosition:number )=>void
   addComment:(taskId:string, text: string )=> void
}


export const BoardProvider = ({children}:{children:ReactNode}) => {
    const dispatch=useAppDispatch()
    const boards=useAppSelector(state=>state.board.boards)

    const isBoardIsLoading=useAppSelector(state=>state.board.loading==="pending")

  const isTaskIsLoading=useAppSelector(state=>state.task.loading==="pending")

  const globalLoading=isBoardIsLoading  ||isTaskIsLoading

    const {boardSlug}=useParams()
    useEffect(()=>{
        dispatch(fetchBoard())
    }, [dispatch])

    const currentBoard = useMemo(() => {
    if (boardSlug) {
        return boards.find((board) => slugify(board.name) === boardSlug) || null;
    }
    if (boards.length > 0) {
        return boards[0];
    }

    return null;
}, [boards, boardSlug]);
    const contextValue:BoardProviderProps=useMemo(()=>({
      board: currentBoard,
      loading: globalLoading,
      addMember: (memberId:string)=>currentBoard && dispatch(addMember({boardId:currentBoard._id, memberId})),
      addColumn: (name:string)=>currentBoard && dispatch(addColumn({boardId:currentBoard._id, name})),
      deleteColumn:(columnId:string)=> currentBoard && dispatch(deleteColumn({boardId:currentBoard._id, columnId})),
      deleteTask:(taskId:string)=> dispatch(deleteTask({taskId})),
      updateTask:(taskId:string, updates:Partial<Task>)=>dispatch(updateTask({taskId, update:updates})),
      moveTask: (taskId:string, toColumnId:string, toPosition:number)=>dispatch(moveTask({taskId, newColumnId:toColumnId, newPosition:toPosition})),
      addComment: (taskId: string, text: string) => dispatch(addComment({ taskId, text }))

    }), [currentBoard, dispatch, globalLoading])
    
  return (
    <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>
  )
}
