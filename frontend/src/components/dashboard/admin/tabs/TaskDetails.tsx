import { useContext, useState } from "react"
import type { Task } from "../../../types/allType"
import {
    Pencil, X, Check, Calendar, User as UserIcon,
    ListChecks, Paperclip, Flag, Clock, Target, ChartBar, WarningCircle
} from "@phosphor-icons/react"
import UserSearchInput from "../../common/UserSearchInput"
import { TaskDetailsHeader } from "../Task/TaskDetailsHeader"
import { BoardContext } from "../../../context/board/BoardContext"
import { ActivityDetails } from "../Task/ActivityDetails"

interface TaskDetailsProps {
    task: Task,
    onClose: () => void,
    status: string | null,
}

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
            <div className="w-8 flex-shrink-0 text-gray-500 pt-1">{icon}</div>
            <div className="flex flex-col flex-grow">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</p>
                <div className="mt-0.5 min-h-[24px] flex items-center">
                    {isEditingThis ? editComponent : children}
                </div>
            </div>
            <div className="flex items-center ml-2">
                {isEditingThis ? (
                    <div className="flex gap-1">
                        <button onClick={handleFieldSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} weight="bold" />
                        </button>
                        <button onClick={handleFieldCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <X size={18} weight="bold" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setActiveField(field)} className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all">
                        <Pencil size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export const TaskDetails = ({ task, status, onClose }: TaskDetailsProps) => {
    const [activeField, setActiveField] = useState<keyof Task | 'timeGoal' | 'dates' | null>(null);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({ ...task });
    const [isdropdown, setIsdropdown] = useState(false);

    const boardDetails = useContext(BoardContext)
    if (!boardDetails) return null
    const { updateTask } = boardDetails

    const handleChange = (field: keyof Task, value: any) => {
        setEditedTask(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldSave = () => {
        let finalUpdate: Partial<Task> = { ...editedTask };

        if (activeField === 'labels' && typeof editedTask.labels === 'string') {
            const labelsArray = (editedTask.labels as string)
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== "")
                .map(tag => ({ name: tag, color: '#3b82f6' }));

            finalUpdate.labels = labelsArray;
        }

        updateTask(task._id, finalUpdate);
        setActiveField(null);
    };

    const handleFieldCancel = () => {
        setEditedTask({ ...task });
        setActiveField(null);
    };

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) return 'Not set';
        const d = date instanceof Date ? date : new Date(date);
        return isNaN(d.getTime()) ? 'Not set' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const msToHours = (ms: number = 0) => (ms / 3600000).toFixed(1);

    // --- UPDATED TIME LOGIC ---
    const goalMs = (editedTask.timeManagement?.estimatedTime || 0) * 3600000;
    const loggedMs = editedTask.timeManagement?.totalLoggedTime || 0;

    // 1. Progress capped at 100%
    const progressPercent = goalMs > 0 ? Math.min((loggedMs / goalMs) * 100, 100) : 0;

    // 2. Calculate Overtime (Delay)
    // If logged time exceeds goal, show the difference as delay
    const overtimeMs = loggedMs > goalMs ? loggedMs - goalMs : 0;
    const delayHours = (overtimeMs / 3600000).toFixed(1);

    const formatToFourDigit = (ms: number) => {
        if (!ms) return "00:00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor((totalSeconds / 60) % 60);
        const hours = Math.floor(totalSeconds / 3600);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
    const priorityColors: Record<Priority, string> = {
        Low: "text-blue-500",
        Medium: "text-green-500",
        High: "text-yellow-500",
        Critical: "text-red-500",
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-gray-100">

                <TaskDetailsHeader task={task} onClose={onClose} />

                <div className="overflow-y-auto grid md:grid-cols-3 divide-x divide-gray-100">

                    {/* LEFT & CENTER CONTENT */}
                    <div className="md:col-span-2 p-6 space-y-8">

                        {/* Title Section */}
                        <div className="space-y-1">
                            {activeField === 'title' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="text-3xl text-black font-bold border-b-2 border-blue-500 outline-none w-full pb-1"
                                        value={editedTask.title || ''}
                                        autoFocus
                                        onChange={(e) => handleChange('title', e.target.value)}
                                    />
                                    <button onClick={handleFieldSave} className="text-green-600 p-2 hover:bg-green-50 rounded-full"><Check size={28} weight="bold" /></button>
                                    <button onClick={handleFieldCancel} className="text-red-600 p-2 hover:bg-red-50 rounded-full"><X size={28} weight="bold" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{editedTask.title}</h2>
                                    <button onClick={() => setActiveField('title')} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-600 transition-all pt-1">
                                        <Pencil size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 border-y border-gray-50 py-4">
                            <div className="flex items-center py-2">
                                <div className="w-8 flex-shrink-0 text-gray-400 pt-1">
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Status</p>
                                    <span className="mt-1 w-fit bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest">
                                        {status || 'OPEN'}
                                    </span>
                                </div>
                            </div>

                            <EditableRow
                                field="assignedTo"
                                label="Assignees"
                                icon={<UserIcon size={20} />}
                                activeField={activeField}
                                setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave}
                                handleFieldCancel={handleFieldCancel}
                                editComponent={
                                    <UserSearchInput
                                        onUserSelect={(selectedUser) => {
                                            const current = Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo : [];
                                            if (!current.some(u => u._id === selectedUser._id)) {
                                                handleChange('assignedTo', [...current, selectedUser]);
                                            }
                                        }}
                                        excludeUserIds={Array.isArray(editedTask.assignedTo) ? editedTask.assignedTo.map(u => u._id) : []}
                                        includeUserIds={boardDetails.board?.members.map((m: any) => m._id)}
                                    />
                                }
                            >
                                <div className="flex -space-x-2">
                                    {Array.isArray(editedTask.assignedTo) && editedTask.assignedTo.map((u: any) => (
                                        <div key={u._id} title={u.name} className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-sm relative group/avatar">
                                            {u.name?.trim()[0]?.toUpperCase()}

                                            {activeField === 'assignedTo' && (
                                                <button
                                                    onClick={() => {
                                                        const filtered = editedTask.assignedTo?.filter((user: any) => user._id !== u._id);
                                                        handleChange('assignedTo', filtered);
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white p-0.5 hover:bg-red-600 shadow-sm"
                                                >
                                                    <X size={8} weight="bold" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {(!editedTask.assignedTo || editedTask.assignedTo.length === 0) && <span className="text-sm text-gray-400">Unassigned</span>}
                                </div>
                            </EditableRow>

                            <EditableRow
                                field="dates" label="Dates" icon={<Calendar size={20} />}
                                activeField={activeField} setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave} handleFieldCancel={handleFieldCancel}
                                editComponent={
                                    <div className="flex gap-2">
                                        <input type="date" className="text-xs border p-1 rounded" value={formatDate(editedTask.startDate)} onChange={(e) => handleChange('startDate', e.target.value)} />
                                        <input type="date" className="text-xs border p-1 rounded" value={formatDate(editedTask.dueDate)} onChange={(e) => handleChange('dueDate', e.target.value)} />
                                    </div>
                                }
                            >
                                <div className="text-sm font-medium text-gray-700">
                                    {formatDate(editedTask.startDate)} <span className="text-gray-300 mx-1">→</span> <span className="text-emerald-600">{formatDate(editedTask.dueDate)}</span>
                                </div>
                            </EditableRow>

                            <EditableRow
                                field="priority" label="Priority" icon={<Flag size={20} />}
                                activeField={activeField} setActiveField={setActiveField}
                                handleFieldSave={handleFieldSave} handleFieldCancel={handleFieldCancel}
                                editComponent={
                                    <div className="relative w-32">
                                        <div className="flex items-center justify-between border p-1 rounded cursor-pointer text-xs" onClick={() => setIsdropdown(!isdropdown)}>
                                            {editedTask.priority} <Flag size={12} weight="fill" className={priorityColors[editedTask.priority as Priority]} />
                                        </div>
                                        {isdropdown && (
                                            <div className="absolute z-10 mt-1 w-full border rounded bg-white shadow-lg overflow-hidden">
                                                {["Low", "Medium", "High", "Critical"].map(p => (
                                                    <div key={p} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer text-xs"
                                                        onClick={() => { handleChange("priority", p); setIsdropdown(false); }}>
                                                        {p} <Flag weight="fill" size={12} className={priorityColors[p as Priority]} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                }
                            >
                                <div className="flex items-center gap-1.5 text-sm font-semibold">
                                    <Flag weight="fill" size={14} className={priorityColors[editedTask.priority as Priority]} />
                                    <span className={priorityColors[editedTask.priority as Priority]}>{editedTask.priority}</span>
                                </div>
                            </EditableRow>
                        </div>

                        {/* --- TIME TRACKING & GOALS SECTION --- */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={16} weight="bold" /> Time Management
                                </h3>
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                    <ChartBar size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-600">{progressPercent.toFixed(0)}% of goal</span>
                                </div>
                            </div>

                            {/* Time Management Grid - Now 3 Columns */}
                            <div className="grid grid-cols-3 gap-6 mb-6">

                                {/* 1. Estimated Goal (Editable) */}
                                <EditableRow
                                    field="timeGoal" label="Estimated Goal" icon={<Target size={20} className="text-blue-600" />}
                                    activeField={activeField} setActiveField={setActiveField}
                                    handleFieldSave={handleFieldSave} handleFieldCancel={handleFieldCancel}
                                    editComponent={
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-16 border rounded px-1.5 py-0.5 text-sm font-bold"
                                                value={editedTask.timeManagement?.estimatedTime || ''}
                                                onChange={(e) => handleChange('timeManagement', { ...editedTask.timeManagement, estimatedTime: Number(e.target.value) })}
                                            />
                                            <span className="text-[10px] font-bold text-slate-400">HRS</span>
                                        </div>
                                    }
                                >
                                    <span className="text-lg font-black text-slate-700">
                                        {editedTask.timeManagement?.estimatedTime || 0}
                                        <span className="text-xs font-normal text-slate-400 uppercase ml-1">hrs</span>
                                    </span>
                                </EditableRow>

                                {/* 2. Total Worked (Capped logic applies to the progress bar, but here we show actual) */}
                                <div className="flex items-center py-2 border-l border-slate-200 pl-6">
                                    <div className="w-8 flex-shrink-0 text-emerald-500 pt-1"><Clock size={20} weight="fill" /></div>
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total Worked</p>
                                        <p className="text-lg font-black text-emerald-600">
                                            {msToHours(loggedMs)} <span className="text-xs font-normal text-slate-400 uppercase ml-1">hrs</span>
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Overtime Delay (Only visible if overtime exists) */}
                                <div className="flex items-center py-2 border-l border-slate-200 pl-6">
                                    {overtimeMs > 0 ? (
                                        <>
                                            <div className="w-8 flex-shrink-0 text-rose-500 pt-1">
                                                <WarningCircle size={20} weight="fill" className="animate-pulse" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-bold text-rose-400 tracking-wider uppercase">Overtime</p>
                                                <p className="text-lg font-black text-rose-600">
                                                    +{delayHours} <span className="text-xs font-normal text-rose-400 uppercase ml-1">hrs</span>
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col opacity-40">
                                            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Overtime</p>
                                            <p className="text-sm font-bold text-gray-400">No Delay</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Combined Progress Section */}
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Task Progress
                                    </span>
                                    <span className={`text-[11px] font-bold ${overtimeMs > 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                                        {overtimeMs > 0 ? 'Goal Exceeded' : `${progressPercent.toFixed(0)}% reached`}
                                    </span>
                                </div>

                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                                    {/* The Actual Progress Bar */}
                                    <div
                                        className={`h-full transition-all duration-700 ease-out ${overtimeMs > 0
                                                ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                                : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                            }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />

                                    {/* Optional: Subtle 100% Marker */}
                                    <div className="absolute right-0 top-0 h-full w-px bg-white/30" />
                                </div>

                                {/* Small helper text below the bar if in overtime */}
                                {overtimeMs > 0 && (
                                    <p className="text-[9px] text-rose-500 font-medium italic animate-pulse">
                                        * Tracking additional {delayHours} hours beyond estimate
                                    </p>
                                )}
                            </div>

                            {/* Daily Breakdown List */}
                            <div className="mt-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Daily Log Breakdown</p>
                                <div className="flex flex-wrap gap-2">
                                    {editedTask.timeManagement?.dailyLogs?.map((log) => (
                                        <div key={log.date} className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex flex-col items-center min-w-[90px] shadow-sm">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-sm font-mono font-black text-slate-700">
                                                {formatToFourDigit(log.duration)}
                                            </span>
                                        </div>
                                    ))}
                                    {(!editedTask.timeManagement?.dailyLogs || editedTask.timeManagement.dailyLogs.length === 0) && (
                                        <span className="text-xs text-slate-300 italic">No time logs recorded yet...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <section className="space-y-3">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ListChecks size={18} weight="bold" /> Description
                                </h3>
                                {activeField !== 'description' && (
                                    <button onClick={() => setActiveField('description')} className="text-gray-300 hover:text-blue-600 transition-all"><Pencil size={18} /></button>
                                )}
                            </div>
                            {activeField === 'description' ? (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full p-4 border border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm leading-relaxed"
                                        rows={5} value={editedTask.description} onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Add a detailed description..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleFieldCancel} className="px-4 py-1.5 text-xs font-bold border rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                        <button onClick={handleFieldSave} className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-shadow shadow-md">Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                                    {editedTask.description || "Click the pencil to add a description..."}
                                </p>
                            )}
                        </section>

                        {/* Attachments Section */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-gray-400"><Paperclip size={20} weight="bold" /></div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-gray-700 mb-3 tracking-tight">Attachments</p>
                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 group hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <Paperclip size={20} className="text-blue-500" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">Drop files or <span className="text-blue-500 font-bold underline">browse</span></p>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{editedTask.attachments?.length || 0} Files attached</p>
                            </div>
                        </div>

                    </div>
                    <div className="bg-gray-50/30">
                        <ActivityDetails editedTask={editedTask} />
                    </div>

                </div>
            </div>
        </div >
    )
}