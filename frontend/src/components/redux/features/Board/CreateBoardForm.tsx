// src/redux/features/Board/CreateBoardForm.tsx (REVISED)

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hook"
import { useForm } from "react-hook-form";
import { createBoard } from './boardSlice'
import { X } from '@phosphor-icons/react'; 
// NEW IMPORT
import UserSearchInput from '../../../dashboard/common/UserSearchInput'; 

// IMPORTANT: We no longer need 'membersInput' in BoardFormInputs as it's now handled by UserSearchInput
interface BoardFormInputs{
    name: string,
    // membersInput is REMOVED/made optional/unused here
}

export const CreateBoardForm = () => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(state => state.board);
    const isPending = loading === 'pending';
    const [currentMembers, setCurrentMembers] = useState<string[]>([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<BoardFormInputs>(); // getValues/setValue are no longer needed for member input
    
    // --- NEW: Handler to receive user ID from the search component ---
    const handleAddMemberId = (userId: string) => {
        // Only add if the ID is not already in the list
        if (!currentMembers.includes(userId)) {
            setCurrentMembers(prev => [...prev, userId]);
        }
    };

    const handleRemoveMember = (idToRemove: string) => {
        setCurrentMembers(prev => prev.filter(id => id !== idToRemove));
    };

    const onSubmit = (data: BoardFormInputs) => {
        if(currentMembers.length === 0){
            alert("Please add at least one member.")
            return
        }
        const boardData = {
            name: data.name,
            members: currentMembers // Sends the collected IDs
        }
        dispatch(createBoard(boardData)).then((result) => {
            if(createBoard.fulfilled.match(result)){
                reset();
                setCurrentMembers([]);
                alert(`Board "${result.payload.name}" created successfully`);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. BOARD NAME INPUT (Unchanged) */}
            <div className="flex flex-col">
                <label htmlFor="name" className="font-medium mb-1 text-gray-700">Project Board Name</label>
                <input
                    id="name"
                    className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#feb238] transition text-black-400"
                    {...register("name", { required: "Board name is required" })}
                    type="text"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* 2. MEMBER INPUT (REPLACED) */}
            <div className="flex flex-col">
                <label className="font-medium mb-1 text-gray-700">Add Members by Name or Email</label>
                <UserSearchInput 
                    onUserSelect={handleAddMemberId}
                    excludeUserIds={currentMembers}
                />
            </div>

            {/* 3. DISPLAY CURRENT MEMBERS (Now showing placeholder for names) */}
            {currentMembers.length > 0 && (
                <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Members to Add ({currentMembers.length}):</p>
                    <div className="flex flex-wrap gap-2">
                        {/* NOTE: If you store the full user object (name, email) instead of just the ID, 
                           you can display the actual name here for better UX. 
                           For now, we display the truncated ID. */}
                        {currentMembers.map((id, index) => (
                            <span 
                                key={index} 
                                className="inline-flex items-center text-xs font-medium bg-gray-300 text-gray-800 rounded-full pl-3 pr-1 py-1 cursor-pointer hover:bg-red-500 hover:text-white transition"
                                onClick={() => handleRemoveMember(id)} 
                            >
                                {id.substring(0, 4)}...{id.slice(-4)} 
                                <X size={12} weight="bold" className="ml-1" />
                            </span>
                        ))}
                    </div>
                </div>
            )}


            {/* 4. FEEDBACK & SUBMIT (Unchanged) */}
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {loading === "succeeded" && <p className="text-green-600 text-sm bg-green-50 p-2 rounded">Project created successfully!</p>}

            <button
                type="submit"
                disabled={isPending || currentMembers.length === 0}
                className="bg-[#feb238] text-white w-full py-3 rounded-md font-semibold hover:bg-[#d69830] transition disabled:opacity-50"
            >
                {isPending ? "Creating Board..." : "Create Project Board"}
            </button>
        </form>
    )
}