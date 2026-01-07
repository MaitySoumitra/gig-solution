import { type  ReactNode, useEffect, useMemo } from "react"
import { BoardContext } from "./BoardContext"
import { useAppDispatch, useAppSelector } from "../../redux/app/hook"
import { useParams } from "react-router-dom"
import { slugify } from "../../hooks/slugify"
import { addMember, fetchBoard } from "../../redux/features/Board/boardSlice"
import type { Board, Task } from "../../types/allType"
import { addColumn, deleteColumn } from "../../redux/features/Column/columnSlice"
import { deleteTask, moveTask, updateTask } from "../../redux/features/Task/taskSlice"

interface BoardProviderProps{
  board: Board | null;
  addMember: (memberId: string)=> void
  addColumn: (name: string)=>void
  deleteColumn: (columnId:string)=> void
  deleteTask: (taskId:string)=>void
  updateTask: (taskId:string, updates:Partial<Task>)=>void
  moveTask: (taskId:string, toColumnId:string, toPosition:number )=>void
}


export const BoardProvider = ({children}:{children:ReactNode}) => {
    const dispatch=useAppDispatch()
    const boards=useAppSelector(state=>state.board.boards)
    const {boardSlug}=useParams()
    useEffect(()=>{
        dispatch(fetchBoard())
    }, [dispatch])

    const currentBoard=useMemo(()=>{
        return boards.find((board)=>slugify(board.name)===boardSlug )|| null
}, [boards, boardSlug]);
    const contextValue:BoardProviderProps=useMemo(()=>({
      board: currentBoard,
      addMember: (memberId:string)=>currentBoard && dispatch(addMember({boardId:currentBoard._id, memberId})),
      addColumn: (name:string)=>currentBoard && dispatch(addColumn({boardId:currentBoard._id, name})),
      deleteColumn:(columnId:string)=> currentBoard && dispatch(deleteColumn({boardId:currentBoard._id, columnId})),
      deleteTask:(taskId:string)=> dispatch(deleteTask({taskId})),
      updateTask:(taskId:string, updates:Partial<Task>)=>dispatch(updateTask({taskId, update:updates})),
      moveTask: (taskId:string, toColumnId:string, toPosition:number)=>dispatch(moveTask({taskId, newColumnId:toColumnId, newPosition:toPosition}))

    }), [currentBoard, dispatch])
    
  return (
    <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>
  )
}
