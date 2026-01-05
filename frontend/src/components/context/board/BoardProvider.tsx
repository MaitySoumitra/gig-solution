import { type  ReactNode, useEffect, useMemo } from "react"
import { BoardContext } from "./BoardContext"
import { useAppDispatch, useAppSelector } from "../../redux/app/hook"
import { useParams } from "react-router-dom"
import { slugify } from "../../hooks/slugify"
import { fetchBoard } from "../../redux/features/Board/boardSlice"


export const BoardProvider = ({children}:{children:ReactNode}) => {
    const dispatch=useAppDispatch()
    const boards=useAppSelector(state=>state.board.boards)
    const {boardSlug}=useParams()
    useEffect(()=>{
        dispatch(fetchBoard())
    }, [dispatch])

    const currentBoard=useMemo(()=>{
        return boards.find((board)=>slugify(board.name)===boardSlug )|| null
}, [boards, boardSlug])
    
  return (
    <BoardContext.Provider value={currentBoard}>{children}</BoardContext.Provider>
  )
}
