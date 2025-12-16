import React, { useState } from "react"
import type { Task, User } from "../../../types/allType"
import { Pencil, X, Calendar, Clock, Tag, User as UserIcon, ListChecks, Paperclip, ChartBar, List, ChatCircleText, ClipboardText } from "@phosphor-icons/react"

// Define the type for the structure you receive for complex fields
type Label = { name: string, color: string };
type Subtask = { title: string, isCompleted: boolean };
type Attachment = { fileName: string, fileUrl: string, uploadedBy: User };
type Comment = { _id: string, user: User[], text: string };
type Activity = { _id: string, user: User[], action: string };

interface TaskDetailsProps {
    task: Task,
    onClose: () => void,
    onSave: (upDatedTask: Partial<Task>) => void
}

export const TaskDetails = ({ task, onClose, onSave }: TaskDetailsProps) => {
    // State to manage edit mode toggle and task data
    const [isEditing, setIsEditing] = useState(false);
    // Use the actual Task type for better type inference on fields
    const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });

    const handaleChange = (field: keyof Task, value: any) => {
        setEditedTask(prev => ({ ...prev, [field]: value }));
    }

    const handaleSave = () => {
        // Here you would implement logic to save editedTask
        // Filter out fields that you don't want to explicitly save if they are complex (like logs)
        onSave(editedTask);
        setIsEditing(false);
    }

    const handaleCancel = () => {
        // Reset state to original task data and exit editing
        setEditedTask({ ...task });
        setIsEditing(false);
    }
    
    // Helper function to format date objects
    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        // Format to YYYY-MM-DD for date input value
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    // Component for displaying or editing a simple detail item
    const DetailItem = ({ icon, label, children }: { icon: JSX.Element, label: string, children: React.ReactNode }) => (
    <div className="flex items-start py-2 border-b border-gray-200 last:border-b-0">
        <div className="w-8 flex-shrink-0 text-gray-500 pt-1">
            {icon}
        </div>
        <div className="flex-grow">
            <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
            {children}
        </div>
    </div>
);
    const PriorityOptions: Array<Task['priority']> = ['Low', 'Medium', 'High', 'Critical'];

    return (
        <div className="fixed inset-0 bg-black/10  flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-7xl max-h-[90vh] overflow-y-auto relative rounded-lg shadow-2xl">

                {/* Header Section */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10 rounded-t-lg">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <input
                                value={editedTask.title || ''}
                                onChange={(e) => handaleChange('title', e.target.value)}
                                className="font-light text-3xl text-gray-900 leading-tight border-b border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                            />
                        ) : (
                            <h2 className="font-light text-3xl text-gray-900 leading-tight">
                                {editedTask.title}
                            </h2>
                        )}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                            title={isEditing ? "Cancel Edit" : "Edit Task"}
                        >
                            <Pencil size={20} />
                        </button>
                    </div>
                    
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                        title="Close"
                    >
                        <X size={20} weight="bold" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 grid md:grid-cols-3 gap-8">
                    
                    {/* Main Details (Description, Subtasks, Comments) - Column 1 & 2 */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Description Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2 border-b pb-1">Description</h3>
                            <div className="text-gray-700 leading-relaxed min-h-[40px] bg-gray-50 p-3 rounded-md border border-gray-100">
                                {isEditing ? (
                                    <textarea
                                        value={editedTask.description || ''}
                                        onChange={(e) => handaleChange('description', e.target.value)}
                                        className="w-full border border-gray-300 p-2 focus:ring-0 resize-y rounded-md"
                                        rows={4}
                                        placeholder="Enter task description..."
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap">{editedTask.description || 'No description provided.'}</p>
                                )}
                            </div>
                        </div>

                        {/* Subtasks Section (View/Simple Input for Edit) */}
                        <div className="pt-4">
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                                <List size={20} className="text-gray-500"/> Subtasks
                            </h3>
                            <div className="space-y-2">
                                {isEditing ? (
                                    // Simple representation for editing subtasks
                                    <input
                                        type="text"
                                        value={
                                            (Array.isArray(editedTask.subtasks) ? editedTask.subtasks.map(s => (s as Subtask).title).join(', ') : '')
                                        }
                                        onChange={(e) => handaleChange('subtasks', e.target.value.split(',').map(t => ({ title: t.trim(), isCompleted: false })))}
                                        placeholder="Comma-separated subtasks..."
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                    />
                                ) : (
                                    // View mode for subtasks
                                    Array.isArray(editedTask.subtasks) && editedTask.subtasks.length > 0 ? (
                                        editedTask.subtasks.map((subtask, index) => {
                                            const sub = subtask as Subtask; // Cast for type safety
                                            return (
                                                <div key={index} className={`flex items-center text-gray-700 p-2 rounded-md border ${sub.isCompleted ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                                                    <ClipboardText size={18} className={`mr-2 ${sub.isCompleted ? 'text-gray-500' : 'text-gray-400'}`} />
                                                    <span className={`truncate ${sub.isCompleted ? 'line-through text-gray-500' : ''}`}>{sub.title}</span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-gray-500 italic">No subtasks defined.</p>
                                    )
                                )}
                            </div>
                        </div>
                        
                        {/* Comments Section (Simplified) */}
                         <div className="pt-4">
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                                <ChatCircleText size={20} className="text-gray-500"/> Comments
                            </h3>
                            <div className="space-y-3 h-40 overflow-y-auto border border-gray-200 p-3 rounded-md bg-gray-50">
                                {Array.isArray(editedTask.comments) && editedTask.comments.length > 0 ? (
                                    editedTask.comments.map((comment, index) => {
                                        const comm = comment as Comment;
                                        const userName = Array.isArray(comm.user) && comm.user.length > 0 ? comm.user[0].name : 'Unknown User';
                                        return (
                                            <div key={index} className="border-l-2 border-gray-300 pl-3">
                                                <p className="font-semibold text-sm text-gray-700">{userName}</p>
                                                <p className="text-sm text-gray-600 italic">{comm.text}</p>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No comments yet.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Activity Log Section (View Only) */}
                        <div className="pt-4">
                            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                                <ChartBar size={20} className="text-gray-500"/> Activity Log
                            </h3>
                            <div className="space-y-2 h-40 overflow-y-auto border border-gray-200 p-3 rounded-md bg-gray-50">
                                {Array.isArray(editedTask.activityLog) && editedTask.activityLog.length > 0 ? (
                                    editedTask.activityLog.map((log, index) => {
                                        const activity = log as Activity;
                                        return (
                                            <p key={index} className="text-sm text-gray-600 border-l-2 border-gray-300 pl-3">
                                                {activity.action}
                                            </p>
                                        )
                                    })
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No activity recorded yet.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Meta Details (Priority, Dates, etc.) - Column 3 */}
                    <div className="md:col-span-1 space-y-1 border border-gray-200 rounded-lg p-4 h-fit">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-1">Details</h3>

                        <DetailItem 
                            icon={<ChartBar size={20} />} 
                            label="Priority" 
                        >
                            {isEditing ? (
                                <select
                                    value={editedTask.priority || 'Medium'}
                                    onChange={(e) => handaleChange('priority', e.target.value as Task['priority'])}
                                    className="w-full border border-gray-300 p-1 rounded-md text-base text-gray-800"
                                >
                                    {PriorityOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className={`text-base font-medium ${editedTask.priority === 'Critical' ? 'text-gray-900' : 'text-gray-800'}`}>
                                    {editedTask.priority || 'Medium'}
                                </p>
                            )}
                        </DetailItem>

                        <DetailItem 
                            icon={<UserIcon size={20} />} 
                            label="Assigned To" 
                        >
                            {isEditing ? (
                                // Simplified input for assignedTo
                                <input
                                    type="text"
                                    value={
                                        (Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo.map(u => (u as User).name).join(', ') : '')
                                    }
                                    onChange={(e) => handaleChange('assignedTo', e.target.value)}
                                    placeholder="e.g. John Doe, Jane"
                                    className="w-full border border-gray-300 p-1 rounded-md text-base text-gray-800"
                                />
                            ) : (
                                <p className="text-base text-gray-800">
                                    {Array.isArray(editedTask.assignedTo) && editedTask.assignedTo.length > 0 
                                        ? editedTask.assignedTo.map(u => (u as User).name).join(', ')
                                        : 'Unassigned'}
                                </p>
                            )}
                        </DetailItem>
                        
                        <DetailItem 
                            icon={<Clock size={20} />} 
                            label="Start Date" 
                        >
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={formatDate(editedTask.startDate)}
                                    onChange={(e) => handaleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                                    className="w-full border border-gray-300 p-1 rounded-md text-base text-gray-800"
                                />
                            ) : (
                                <p className="text-base text-gray-800">{editedTask.startDate ? formatDate(editedTask.startDate) : 'No Start Date'}</p>
                            )}
                        </DetailItem>

                        <DetailItem 
                            icon={<Calendar size={20} />} 
                            label="Due Date" 
                        >
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={formatDate(editedTask.dueDate)}
                                    onChange={(e) => handaleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                                    className="w-full border border-gray-300 p-1 rounded-md text-base text-gray-800"
                                />
                            ) : (
                                <p className="text-base text-gray-800">{editedTask.dueDate ? formatDate(editedTask.dueDate) : 'No Due Date'}</p>
                            )}
                        </DetailItem>
                        
                        <DetailItem 
                            icon={<Tag size={20} />} 
                            label="Labels" 
                        >
                            {isEditing ? (
                                // Simplified input for labels
                                <input
                                    type="text"
                                    value={editedTask.labels as string || ''}
                                    onChange={(e) => handaleChange('labels', e.target.value)}
                                    placeholder="Comma-separated labels"
                                    className="w-full border border-gray-300 p-1 rounded-md text-base text-gray-800"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {/* Assuming labels is an array of objects for display */}
                                    {Array.isArray(editedTask.labels) && editedTask.labels.length > 0 ? (
                                        (editedTask.labels as Label[]).map((label, index) => (
                                            <span key={index} className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                                                {label.name}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-base text-gray-800">None</p>
                                    )}
                                </div>
                            )}
                        </DetailItem>
                        
                        <DetailItem 
                            icon={<Paperclip size={20} />} 
                            label="Attachments" 
                        >
                            {isEditing ? (
                                // Simplified input for attachments
                                <p className="text-sm italic text-gray-500">
                                    Attachments require a dedicated upload component.
                                </p>
                            ) : (
                                <p className="text-base text-gray-800">
                                    {Array.isArray(editedTask.attachment) && editedTask.attachment.length > 0
                                        ? `${editedTask.attachment.length} file(s) attached`
                                        : 'No Attachments'}
                                </p>
                            )}
                        </DetailItem>
                        
                        {/* Save/Cancel Buttons for Edit Mode */}
                        {isEditing && (
                            <div className="pt-6 border-t border-gray-300 mt-4 space-y-2">
                                <button
                                    onClick={handaleSave}
                                    className="w-full py-2 px-4 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handaleCancel}
                                    className="w-full py-2 px-4 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}