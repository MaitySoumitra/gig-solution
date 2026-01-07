import { useState, } from "react"
import type { Task } from "../../../types/allType"
import {
    Pencil, X, Check, Calendar,  Tag, User as UserIcon, ListChecks, Paperclip, ClipboardText, List, UsersIcon, Flag, At, PaperPlaneRight, Folder, Plus, ArrowSquareOut, Star, CornersOut, DotsThree, Sparkle
} from "@phosphor-icons/react"
import UserSearchInput from "../../common/UserSearchInput"
import { TaskDetailsHeader } from "../Task/TaskDetailsHeader"



interface TaskDetailsProps {
    task: Task,
    onClose: () => void,
    onSave: (upDatedTask: Partial<Task>) => void,
    status: string | null,
    onDeleteTask: (taskId: string)=>void
}
// MOVE THIS OUTSIDE THE TaskDetails FUNCTION
const EditableRow = ({
    field,
    label,
    icon,
    children,
    editComponent,
    activeField,
    setActiveField,
    handleFieldSave,
    handleFieldCancel
}: any) => {
    const isEditingThis = activeField === field;

    return (
        <div className="group flex items-center py-2">
            <div className="w-8 flex-shrink-0 text-gray-600 pt-1">{icon}</div>
            <div className="flex justify-center items-center">
                <p className="w-32 text-sm font-bold text-gray-600 tracking-wider">{label}</p>
                <div className="mt-1">{isEditingThis ? editComponent : children}</div>
            </div>
            <div className="flex items-center ml-2">
                {isEditingThis ? (
                    <div className="flex gap-1">
                        {/* Save Button */}
                        <button onClick={handleFieldSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={20} weight="bold" />
                        </button>
                        {/* Cancel Button */}
                        <button onClick={handleFieldCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={20} weight="bold" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setActiveField(field)} className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all">
                        <Pencil size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export const TaskDetails = ({ task, onClose, onSave, status, onDeleteTask }: TaskDetailsProps) => {
    // track which field is currently being edited
    const [activeField, setActiveField] = useState<keyof Task | null>(null);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });
    const [isdropdown, setIsdropdown] = useState(false);

  

    const handleChange = (field: keyof Task, value: any) => {
        setEditedTask(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldSave = () => {
        let finalUpdate = { ...editedTask };
        if (activeField === 'labels' && typeof editedTask.labels === 'string') {
            const labelsArray = (editedTask.labels as string)
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== "")
                .map(tag => ({ name: tag, color: '#3b82f6' }));
            finalUpdate.labels = labelsArray;
        }
        onSave(finalUpdate);
        setActiveField(null);
    };

    const handleFieldCancel = () => {
        setEditedTask({ ...task });
        setActiveField(null);
    };
    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };
   

    type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
    const priorityColors: Record<Priority, string> = {
        Low: "text-blue-500",
        Medium: "text-green-500",
        High: "text-yellow-500",
        Critical: "text-red-500",
    };

    // reusable row for the sidebar fields

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl">
               <TaskDetailsHeader onClose={onClose} task={task} onDeleteTask={onDeleteTask}/>

                <div className="overflow-y-auto grid md:grid-cols-3 ">
                    <div className="md:col-span-2 p-3">
                        <div className="flex-grow">
                            {activeField === 'title' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="text-2xl text-black font-semibold border-b-2 border-blue-500 outline-none w-full"
                                        value={editedTask.title || ''}
                                        onChange={(e) => handleChange('title', e.target.value)}

                                    />
                                    <button onClick={handleFieldSave} className="text-green-600"><Check size={24} /></button>
                                    <button onClick={handleFieldCancel} className="text-red-600"><X size={24} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h2 className="text-2xl font-semibold text-gray-800">{editedTask.title}</h2>
                                    <button onClick={() => setActiveField('title')} className="opacity-0 group-hover:opacity-100 text-gray-400"><Pencil size={18} /></button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-10 w-full">
                            <div className=" flex items-center py-2 gap-3 font-bold text-gray-400">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex  items-center justify-center">
                                    <div className="w-[10px] h-[10px] rounded-full border-2 border-gray-500" ></div>
                                </div>

                                <div className="w-32 text-sm text-gray-600">Status</div>
                                <span className="bg-[#2D9B71] text-white text-[11px] font-bold px-3 py-1 rounded  tracking-wider">
                                    {status || 'OPEN'}
                                </span>
                            </div>

                            <EditableRow
                                field="assignedTo"
                                label="ASSIGNEES"
                                icon={<UserIcon size={20} />}
                                activeField={activeField}
                                setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave}    // MUST PASS THIS
                                handleFieldCancel={handleFieldCancel} // MUST PASS THIS
                                editComponent={
                                    <UserSearchInput onUserSelect={(selectedUser) => {
                                        const currentAssigned = Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo : [];
                                        if (!currentAssigned.some(u => u._id === selectedUser._id)) {
                                            handleChange('assignedTo', [...currentAssigned, selectedUser]);
                                        }
                                    }} excludeUserIds={Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo.map(u => u._id) : []} />
                                }
                            >
                                <div className="flex -space-x-2">
                                    {Array.isArray(editedTask.assignedTo) && editedTask.assignedTo.map((u: any) => (
                                        <div key={u._id} title={u.name} className="w-8 h-8 rounded-full bg-purple-400 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold cursor-pointer">
                                            {u.name?.trim()[0]?.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </EditableRow>
                        </div>
                        <div className="grid grid-cols-2 gap-10 w-full">
                            {/* DATES ROW */}
                            <EditableRow
                                field="dates"
                                label="DATES"
                                icon={<Calendar size={20} />}
                                activeField={activeField}
                                setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave}
                                handleFieldCancel={handleFieldCancel}
                                editComponent={
                                    <div className="flex gap-2">
                                        <input type="date" className="text-xs border p-1 rounded" onChange={(e) => handleChange('startDate', e.target.value)} />
                                        <input type="date" className="text-xs border p-1 rounded" onChange={(e) => handleChange('dueDate', e.target.value)} />
                                    </div>
                                }
                            >
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                    <span>{formatDate(editedTask.startDate)}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-green-700 font-medium">{formatDate(editedTask.dueDate)}</span>
                                </div>
                            </EditableRow>

                            {/* PRIORITY ROW */}
                            <EditableRow
                                field="priority"
                                label="PRIORITY"
                                icon={<Flag size={20} />}
                                activeField={activeField}
                                setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave}
                                handleFieldCancel={handleFieldCancel}
                                editComponent={
                                    <div className="relative w-25">
                                        <div className="flex items-center gap-2 border p-1 rounded cursor-pointer" onClick={() => setIsdropdown(!isdropdown)}>
                                            <Flag
                                                size={14}
                                                weight="fill"
                                                className={
                                                    editedTask.priority
                                                        ? priorityColors[editedTask.priority as keyof typeof priorityColors]
                                                        : "text-gray-400"
                                                }
                                            />
                                            {editedTask.priority}
                                        </div>
                                        {isdropdown && (
                                            <div className="absolute z-10 mt-1 w-full border rounded bg-white shadow">
                                                {["Low", "Medium", "High", "Critical"].map(p => (
                                                    <div key={p} className=" flex items-center gap-3 p-1 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { handleChange("priority", p); setIsdropdown(false); }}> <Flag
                                                        weight="fill"
                                                        size={14}
                                                        className={priorityColors[p as keyof typeof priorityColors]}
                                                    />{p}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                }
                            >
                                <span className="text-sm flex gap-3 items-center"><Flag
                                    size={14}
                                    weight="fill"
                                    className={
                                        editedTask.priority
                                            ? priorityColors[editedTask.priority as keyof typeof priorityColors]
                                            : "text-gray-400"
                                    }
                                /> {editedTask.priority}</span>
                            </EditableRow>
                        </div>
                        {/* LABELS ROW - This is the one you were stuck on */}
                        <EditableRow
                            field="labels"
                            label="Labels"
                            icon={<Tag size={20} />}
                            activeField={activeField}
                            setActiveField={setActiveField}
                            handleFieldSave={handleFieldSave}
                            handleFieldCancel={handleFieldCancel}
                            editComponent={
                                <input
                                    autoFocus  // KEEPS THE CURSOR ACTIVE
                                    type="text"
                                    className="text-sm border rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-blue-500"
                                    value={
                                        typeof editedTask.labels === 'string'
                                            ? editedTask.labels
                                            : (Array.isArray(editedTask.labels)
                                                ? editedTask.labels.map((l: any) => typeof l === 'string' ? l : l.name).join(', ')
                                                : '')
                                    }
                                    onChange={(e) => handleChange('labels', e.target.value)}
                                />
                            }
                        >
                            <div className="flex gap-2 items-center min-h-[24px]">
                                {Array.isArray(editedTask.labels) && editedTask.labels.length > 0 ? (
                                    editedTask.labels.map((label: any, index: number) => (
                                        <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg tracking-tight">
                                            {typeof label === 'string' ? label : label.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-300">empty</span>
                                )}
                            </div>
                        </EditableRow>
                        {/* DESCRIPTION */}
                        <section>
                            <div className="flex justify-between items-center mb-2 border-b pb-1">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><ListChecks size={20} /> Description</h3>
                                {activeField !== 'description' && (
                                    <button onClick={() => setActiveField('description')} className="text-gray-400 hover:text-blue-600"><Pencil size={18} /></button>
                                )}
                            </div>
                            {activeField === 'description' ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={4}
                                        value={editedTask.description} onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleFieldCancel} className="px-3 py-1 text-sm border rounded">Cancel</button>
                                        <button onClick={handleFieldSave} className="px-3 py-1 text-sm bg-gray-800 text-white rounded">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg min-h-[100px]">{editedTask.description || "No description."}</p>
                            )}
                        </section>

                        {/* SUBTASKS */}
                        <section>
                            <div className="flex justify-between items-center mb-2 border-b pb-1">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><List size={20} /> Subtasks</h3>
                                {activeField !== 'subtasks' && (
                                    <button onClick={() => setActiveField('subtasks')} className="text-gray-400 hover:text-blue-600"><Pencil size={18} /></button>
                                )}
                            </div>
                            {activeField === 'subtasks' ? (
                                <div className="space-y-2">
                                    <input
                                        type="text" className="w-full border p-2 rounded" placeholder="Comma separated subtasks..."
                                        value={Array.isArray(editedTask.subtasks) ? editedTask.subtasks.map((s: any) => s.title).join(', ') : ''}
                                        onChange={(e) => handleChange('subtasks', e.target.value.split(',').map(t => ({ title: t.trim(), isCompleted: false })))}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleFieldCancel} className="text-xs border px-2 py-1 rounded">Cancel</button>
                                        <button onClick={handleFieldSave} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {Array.isArray(editedTask.subtasks) && editedTask.subtasks.map((sub: any, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                                            <ClipboardText size={16} /> {sub.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="py-3 flex items-start">
                            <div className="w-8 text-gray-400"><Paperclip size={20} /></div>
                            <div className=" w-full">
                                <p className="text-sm font-bold text-gray-700 mb-4 tracking-tight">Attachments</p>
                                <div className="border border-dashed border-gray-400 rounded-lg p-5 flex flex-col items-center justify-center bg-gray-50/50">
                                    <p className="text-xs text-gray-400">Drop your files here to <span className="text-blue-500 underline cursor-pointer">upload</span></p>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{editedTask.attachment?.length || 0} Files</p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sidebar Details */}
                    <div className="bg-white border-l border-gray-200 shadow-sm space-y-1 h-full">
                        <h3 className="font-medium text-gray-400 mb-4  p-3 border-b border-gray-200">Activity</h3>

                        <div className="flex flex-col  bg-white overflow-hidden max-w-2xl">
                            {/* 1. Activity & Comments Feed Area */}
                            <div className="p-4 h-64 overflow-y-auto space-y-4 bg-white">
                                {/* Activity Logs (e.g., Priority changes) */}
                                {editedTask.activityLog?.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="text-gray-400">•</span>
                                        <span>{a.action}</span>
                                        <span className="ml-auto text-gray-400">20 mins</span>
                                    </div>
                                ))}

                                {/* User Comments */}
                                {editedTask.comments?.map((c, i) => (
                                    <div key={i} className="flex flex-col text-sm border-l-2 border-gray-100 pl-3 py-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-700">{c.user[0]?.name}</span>
                                            <span className="text-[10px] text-gray-400">Apr 21, 4:12 pm</span>
                                        </div>
                                        <p className="text-gray-600">{c.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* 2. Custom Input Area */}
                            <div className="border-t border-gray-200 p-3 bg-white">
                                <div className="border border-gray-200 rounded-md ">
                                    <textarea
                                        className="w-full p-3 text-sm outline-none resize-none"
                                        placeholder="Write a comment..."
                                        rows={2}
                                    />

                                    <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50/50">
                                        <div className="flex items-center gap-1">
                                            {/* Action Buttons */}
                                            <button className="p-2 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                                                <Paperclip size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                                                <At size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-300 hover:text-blue-500 transition-colors">
                                                <PaperPlaneRight size={20} weight="fill" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div >
    )
}