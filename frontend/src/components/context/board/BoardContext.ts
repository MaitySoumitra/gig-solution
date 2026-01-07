import { createContext } from "react";
import type { Board, Task } from "../../types/allType";
export interface BoardProviderProps{
  board: Board | null;
  addMember: (memberId: string)=> void
  addColumn: (name: string)=>void
  deleteColumn: (columnId:string)=> void
  deleteTask: (taskId:string)=>void
  updateTask: (taskId:string, updates:Partial<Task>)=>void
  moveTask: (taskId:string, toColumnId:string, toPosition:number )=>void
}
export const BoardContext=createContext<BoardProviderProps | null>(null)

