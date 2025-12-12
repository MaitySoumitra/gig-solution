import React, { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/app/hook'
import { addMember, fetchBoard } from '../../../redux/features/Board/boardSlice'
import { Plus } from '@phosphor-icons/react';

import UserSearchInput from '../../common/UserSearchInput';
import { addColumn } from '../../../redux/features/Column/columnSlice';
interface User {
    _id: string;
    name: string;
    email?: string;
    role?: string;
}
export const ProjectDetails = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
    const [columnName, setColumnName] = useState("")
    const [showColumnInput, setShowColumnInput] = useState(false)
    const dispatch = useAppDispatch()
    const board = useAppSelector(state => state.board.boards)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        dispatch(fetchBoard())
    }, [])
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        window.addEventListener('mousedown', handleClickOutside)
        return () => window.removeEventListener('mousedown', handleClickOutside)
    }, [])
    return (
        <div>
            {
                board?.map((b) => {
                    return (
                        <div key={b._id} className='max-w-6xl mx-auto'>
                            <div className='flex px-2 py-3 bg-gray-200 justify-between'>
                                <h2 className='font-bold text-[25px]'>{b.name}</h2>
                                <div className='flex space-x-3 justify-center items-center'>
                                    <div className='flex space-x-[-10px]'>
                                        {b.members.map((m: any) => (
                                            <div
                                                key={m._id}
                                                className='w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-sm font-bold'
                                                title={m.name}
                                            >
                                                {m.name[0].toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                    <p
                                        className='font-bold cursor-pointer'
                                        onClick={() => {
                                            setIsOpen(true)
                                            setCurrentBoardId(b._id)
                                            setSelectedUser(null)
                                        }}
                                    ><Plus /></p>
                                    <div className='relative'>

                                        {isOpen && currentBoardId === b._id && (
                                            <div ref={dropdownRef} className='absolute left-[-250px] top-[35px] w-60 border border-gray-50 px-3 py-4 shadow-lg rounded'>


                                                <UserSearchInput
                                                    onUserSelect={(user) => {
                                                        setSelectedUser(user)

                                                    }}
                                                    excludeUserIds={b.members.map(m => m._id)}
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

                                                        console.log("➡️ Adding member:", selectedUser);

                                                        dispatch(addMember({
                                                            boardId: b._id,
                                                            memberId: selectedUser._id
                                                        }))
                                                            .then((res) => {
                                                                console.log("✅ addMember result:", res);
                                                            })
                                                            .catch((err) => {
                                                                console.error("❌ addMember error:", err);
                                                            });

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
                            {}
                            <div className="mt-4">
                                {!showColumnInput ? (
                                    <button
                                        onClick={() => {
                                            setShowColumnInput(true);
                                            setCurrentBoardId(b._id);   // IMPORTANT
                                        }}
                                        className='px-3 py-2 bg-blue-500 text-white rounded shadow'
                                    >
                                        + Add Column
                                    </button>
                                ) : (
                                    <div className="flex space-x-2 items-center">
                                        <input
                                            value={columnName}
                                            onChange={(e) => setColumnName(e.target.value)}
                                            placeholder="Column name"
                                            className="px-2 py-1 border rounded"
                                        />

                                        <button
                                            onClick={() => {
                                                dispatch(addColumn({
                                                    boardId: b._id,    // use board ID directly
                                                    name: columnName
                                                }))
                                                    .then(res => console.log("Column added:", res))
                                                    .catch(err => console.error("Column add error:", err));

                                                setColumnName("");
                                                setShowColumnInput(false);
                                            }}
                                            className="px-3 py-1 bg-green-500 text-white rounded"
                                        >
                                            Save
                                        </button>
                                        <button onClick={()=>setShowColumnInput(false)}>
                                           ❌
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })
            }


        </div>
    )
}
