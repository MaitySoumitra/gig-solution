
import { useState, useRef, useEffect, useContext } from "react"
import { Plus, X } from '@phosphor-icons/react';
import UserSearchInput from '../UserSearchInput';
import { BoardContext } from "../../context/BoardContext";
import { getAvatarColor } from "../../utils/avatarColor";
import type {User} from '../../types/allType'

export const DashBoardHeader = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const boardDetails = useContext(BoardContext)
    if (!boardDetails) return null
    const { board, addMember } = boardDetails

    useEffect(() => {
        const handaleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        window.addEventListener("mousedown", handaleClickOutside)
        return () => window.removeEventListener("mousedown", handaleClickOutside)
    }, [])
    if (!board) return null

    return (
        <div className="px-6 pt-6">
            <div className="w-full bg-white rounded-xl  flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black text-white font-semibold text-lg flex items-center justify-center shadow-md">
                        {board.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 -my-2">{board.name}</h2>
                        <span className="text-xs font-medium text-gray-500 ">
                            Project members & collaboration
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {board.members.slice(0, 4).map((m) => (
                            <div
                                key={m._id}
                                title={m.name}
                                style={{ backgroundColor: getAvatarColor(m.name) }}
                                className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center border-2 border-white"
                            >
                                {m.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {board.members.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center border-2 border-white">
                                +{board.members.length - 4}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setIsOpen(true);
                            setSelectedUser(null);
                        }}
                        className="flex items-center gap-1 px-4 h-9 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900"
                    >
                        <Plus size={14} />
                        Invite
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
                    <div
                        ref={dropdownRef}
                        className="w-[480px] bg-white rounded-2xl shadow-2xl p-6 relative"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 text-white  bg-black bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Invite Member
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Search and invite a teammate to collaborate on this project.
                            </p>
                        </div>

                        {/* SEARCH */}
                        <UserSearchInput
                            onUserSelect={(u) => setSelectedUser(u)}
                            excludeUserIds={board.members.map((m) => m._id)}
                        />

                        {selectedUser && (
                            <div className="flex items-center justify-between mt-3 bg-gray-100 p-2 rounded-lg">
                                <span className="text-sm">{selectedUser.name}</span>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* BUTTON */}
                        <button
                            disabled={!selectedUser}
                            onClick={() => {
                                if (!selectedUser) return;
                                addMember(selectedUser._id)
                                setSelectedUser(null);
                            }}
                            className={`mt-5 w-full h-11 rounded-full bg-black text-white font-medium transition
          ${!selectedUser ? "opacity-100 cursor-not-allowed" : "hover:bg-gray-900"}
        `}
                        >
                            Invite Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
