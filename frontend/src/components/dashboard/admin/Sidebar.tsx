import { NavLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/app/hook"
import { useEffect, useState } from "react"
import { fetchBoard } from "../../redux/features/Board/boardSlice"
import { slugify } from '../../hooks/slugify'
import { Plus } from "@phosphor-icons/react"
import { BoardTab } from "./tabs/BoardTab"
export const Sidebar = () => {
    const [showBoard, setShowBoard] = useState<boolean>(false);
    const [createBoard, setCreateBoard] = useState<boolean>(false)
    const base = "block  py-3 px-3"
    const active = "text-blue-600 border-l-4 border-blue-600 bg-blue-50"
 
    const inactive = "text-gray-500"

    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user)
    const board = useAppSelector(state => state.board.boards)
    
    const role = user?.role
    useEffect(() => {
        dispatch(fetchBoard())
    }, [dispatch])

    if (role === 'admin' || role === 'super-admin') {

    }
    return (
        <div className="w-40 relative mt-12">
            <NavLink
                to={`/${role}/dashboard`}
                end
                className={({ isActive }) => `${base} ${isActive ? active : inactive} `}
            >
                Home
            </NavLink>
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowBoard(!showBoard)}
                    className={`${base} ${inactive} `}
                >
                    Project Board
                </button>
                <button onClick={() => setCreateBoard(!createBoard)} className="relative inline-block"><Plus /></button >
                {createBoard && (
                    <div className="absolute left-full top-15 ml-2 w-70 p-4 rounded-lg bg-gray-50 shadow-lg z-50">
                        <BoardTab />
                    </div>
                )}
            </div>
            {showBoard && (
                <>
                    {board.map(b => {
                        const slug = slugify(b.name)
                        return (
                            <NavLink
                                to={`/${role}/dashboard/${slug}`}
                                end
                                className={({ isActive }) => `${"block py-1 px-2 gap-2 text-sm"} ${isActive ? "bg-gray-100 rounded-md  font-" : "hover:rounded-md hover:bg-gray-100"} `}
                                key={b._id}
                            >
                                {b.name}
                            </NavLink>
                        )
                    })}
                </>
            )}
            <button onClick={() => setCreateBoard(!createBoard)} className="text-sm text-gray-400 w-full appearance-none flex justify-center items-center gap-2 p-1 border border-gray-300 border-dotted rounded"><Plus />Create Project</button >
        </div>
    )
}
