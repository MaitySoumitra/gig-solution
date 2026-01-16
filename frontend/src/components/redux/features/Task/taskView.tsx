import React from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../app/hook";
import { addTask } from "./taskSlice";
import type { Task } from "../../../types/allType";

interface Props {
    boardId: string;
    columnId: string;
}

const TaskView: React.FC<Props> = ({ boardId, columnId }) => {
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Task>();

    const onSubmit = (data: Task) => {
        dispatch(
            addTask({
                boardId,
                columnId,
                taskData: {
                    ...data,
                    startDate: data.startDate ? new Date(data.startDate) : undefined,
                    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                },
            })
        )
            .unwrap()
            .then(() => {
                reset();
            })
            .catch((err) => {
                console.error("Add task failed:", err);
            });
    };


    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-4 rounded shadow space-y-3"
        >
            <h3 className="font-bold text-lg">Add Task</h3>

            {/* Title */}
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

            {/* Description */}
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
