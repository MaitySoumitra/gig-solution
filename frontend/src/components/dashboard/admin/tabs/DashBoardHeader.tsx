
import { useState, useRef, useEffect, useContext } from "react"
import { Plus } from '@phosphor-icons/react';
import UserSearchInput from '../../common/UserSearchInput';
import { BoardContext } from "../../../context/board/BoardContext";

interface User {
    _id: string;
    name: string;
    email?: string;
    role?: string;
}
interface DashBoardHeaderProps {

    onAddMember: (boardId: string, memberId: string) => void
}
export const DashBoardHeader = ({ onAddMember }: DashBoardHeaderProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const board=useContext(BoardContext)
    if(!board) return null
    useEffect(() => {
        const handaleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        window.addEventListener("mousedown", handaleClickOutside)
        return () => window.removeEventListener("mousedown", handaleClickOutside)
    }, [])

    return (
        <div>
            <div className='flex px-2 py-3 bg-gray-100 justify-between rounded-lg'>
                <h2 className='font-bold text-[25px]'>{board.name}</h2>
                <div className='flex space-x-3 justify-center items-center'>
                    <div className="flex gap-0">
                        <div className='flex space-x-[-10px]'>
                            {board.members.slice(0, 3).map((m: any) => (
                                <div
                                    key={m._id}
                                    className='w-8 h-8 rounded-full bg-blue-300 flex gap-3 items-center justify-center text-sm font-bold'
                                    title={m.name}
                                >
                                    {m.name[0].toUpperCase()}
                                </div>
                            ))}
                        </div>
                        {board.members.length > 3 && (
                            <div className="text-blue-300 font-bold text-lg">+{board.members.length - 3} </div>
                        )}
                    </div>
                    <p
                        className='font-bold cursor-pointer'
                        onClick={() => {
                            setIsOpen(true)
                            setCurrentBoardId(board._id)
                            setSelectedUser(null)
                        }}
                    ><Plus /></p>
                    <div className='relative'>

                        {isOpen && currentBoardId === board._id && (
                            <div ref={dropdownRef} className='absolute left-[-250px] top-[35px] w-60 border border-gray-50 px-3 py-4 shadow-lg rounded'>
                                <UserSearchInput
                                    onUserSelect={(user) => {
                                        setSelectedUser(user)
                                    }}
                                    excludeUserIds={board.members.map(m => m._id)}
                                />
                                {selectedUser && (
                                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
                                        <span>{selectedUser.name}</span>
                                        <button
                                            className="text-red-500 font-bold"
                                            onClick={() => setSelectedUser(null)}
                                        >
                                            x
                                        </button>
                                    </div>
                                )}

                                <button
                                    disabled={!selectedUser}
                                    onClick={() => {
                                        if (!selectedUser) return;
                                        onAddMember(board._id, selectedUser._id)
                                        setSelectedUser(null);
                                    }}
                                    className='mt-3 w-full px-2 py-3 bg-gray-100 hover:bg-gray-200 text-center rounded'
                                >
                                    Add Member
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
