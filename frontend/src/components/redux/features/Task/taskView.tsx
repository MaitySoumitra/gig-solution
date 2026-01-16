import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { addTask } from "./taskSlice";
import type { Task } from "../../../types/allType";
import UserSearchInput from "../../../dashboard/common/UserSearchInput";
import { X } from "@phosphor-icons/react";

interface Props {
    boardId: string;
    columnId: string;
}

const TaskView: React.FC<Props> = ({ boardId, columnId }) => {
    const [editedTask, setEditedTask] = useState<Partial<Task>>({ assignedTo: [] });
    const dispatch = useAppDispatch();
    const boards = useAppSelector(state => state.board.boards);
    
    const currentBoard = boards.find(b => b._id === boardId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<Task>();

    const onSubmit = (data: Task) => {
        dispatch(addTask({
            boardId,
            columnId,
            taskData: {
                ...data,
                assignedTo: editedTask.assignedTo,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
        }))
        .unwrap()
        .then(() => {
            reset();
            setEditedTask({ assignedTo: [] });
        });
    };

    const handleChange = (field: keyof Task, value: any) => {
        setEditedTask(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow space-y-3"
        >
            <h3 className="font-bold text-lg">Add Task</h3>
            <div>
                <input
                    {...register("title", { required: "Title is required" })}
                    placeholder="Task title"
                    className="w-full border px-3 py-2 rounded"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <textarea
                {...register("description")}
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
            />
            <div className="flex space-x-2">
                <input type="date" {...register("startDate")} className="px-3 py-2 rounded border w-full" />
                <input
                    type="date"
                    {...register("dueDate")}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>
            <select
                {...register("priority", { required: true })}
                className="w-full border px-3 py-2 rounded"
            >
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
            </select>
            <div className="space-y-2">
                <UserSearchInput
                    onUserSelect={(selectedUser) => {
                        const current = Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo : [];
                        if (!current.some(u => u._id === selectedUser._id)) {
                            handleChange('assignedTo', [...current, selectedUser]);
                        }
                    }}
                    excludeUserIds={Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo.map(u => u._id) : []}
                    includeUserIds={currentBoard?.members.map((m: any) => m._id) || []}
                />

                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(editedTask.assignedTo) && editedTask.assignedTo.map((u: any) => (
                        <div key={u._id} className="flex items-center gap-2 bg-slate-100 pl-1 pr-2 py-1 rounded-full border border-slate-200">
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                                {u.name?.trim()[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-700">{u.name}</span>
                            <button 
                                type="button"
                                onClick={() => {
                                    const filtered = editedTask.assignedTo?.filter((user: any) => user._id !== u._id);
                                    handleChange('assignedTo', filtered);
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={14} weight="bold" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded"
            >
                Add Task
            </button>
        </form>
    );
};

export default TaskView;
