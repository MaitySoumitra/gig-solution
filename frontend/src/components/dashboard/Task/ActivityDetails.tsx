import { Paperclip, PaperPlaneRight, CaretDown, CaretUp, XCircle, File } from "@phosphor-icons/react";
import { useContext, useState, useRef, useMemo, memo } from "react";
import { BoardContext } from "../../context/BoardContext";
import { useAppSelector } from "../../redux/app/hook";

interface ActivityDetailsProps {
    taskId: string | undefined; // Pass only the ID to prevent typing lag
}

const getRelativeTime = (date: string | Date) => {
    if (!date) return "";
    const now = new Date().getTime();
    const before = new Date(date).getTime();
    const diff = Math.floor((now - before) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
};

export const ActivityDetails = memo(({ taskId }: ActivityDetailsProps) => {
    const [commentText, setCommentText] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const boardDetails = useContext(BoardContext);
    
    // 1. Get the "Real" task data from Context (which comes from Redux)
    // This data does NOT change when you type in the Edit Title/Description inputs
    const taskData = useMemo(() => {
        return boardDetails?.task.find(t => t._id === taskId);
    }, [boardDetails?.task, taskId]);

    const user = useAppSelector(state => state.login.user);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendComment = async () => {
        if ((!commentText.trim() && selectedFiles.length === 0) || !taskId) return;

        const formData = new FormData();
        formData.append("text", commentText);
        selectedFiles.forEach(file => {
            formData.append("files", file);
        });

        await boardDetails?.addComment?.(taskId, formData);
        
        setCommentText("");
        setSelectedFiles([]);
    };

    // 2. Memoize sorting logic so it doesn't run on every small UI change
   // Inside ActivityDetails.tsx

const activities = useMemo(() => {
    // Just return the array as is (newest will be at the end)
    return taskData?.activityLog || [];
}, [taskData?.activityLog]);

const comments = useMemo(() => {
    return taskData?.comments || [];
}, [taskData?.comments]);

    const displayedActivities = showAllActivity ? activities : activities.slice(0, 3);
    const displayedComments = showAllComments ? comments : comments.slice(0, 3);

    if (!taskData) return null;

    return (
        <div className="bg-white border-l border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <h3 className="font-medium text-gray-600 p-4 border-b border-gray-100 uppercase text-xs tracking-widest shrink-0">
                Update Feed
            </h3>

            <div className="flex-grow flex flex-col overflow-hidden">
                {/* --- ACTIVITY SECTION --- */}
                <div className="flex flex-col border-b border-gray-100 max-h-[40%] p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Recent Activity</span>
                        {activities.length > 3 && (
                            <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5">
                                {showAllActivity ? 'Hide' : `Show All (${activities.length})`}
                                {showAllActivity ? <CaretUp /> : <CaretDown />}
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto space-y-4 pr-1">
                        {displayedActivities.map((item, i) => (
                            <div key={item._id || i} className="flex flex-col gap-1">
                                <div className="flex items-start gap-2 text-xs text-gray-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <p><span className="font-bold text-gray-700">{item.user?._id === user?._id ? "You" : item.user?.name}</span> {item.action}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 ml-3">{getRelativeTime(item.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- COMMENTS SECTION --- */}
                <div className="flex flex-col flex-grow p-4 overflow-hidden bg-gray-50/20">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Comments</span>
                        {comments.length > 3 && (
                            <button onClick={() => setShowAllComments(!showAllComments)} className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5">
                                {showAllComments ? 'Hide' : `Show All (${comments.length})`}
                                {showAllComments ? <CaretUp /> : <CaretDown />}
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto space-y-4 pr-1">
                        {displayedComments.map((item, i) => (
                            <div key={item._id || i} className="flex flex-col gap-1">
                                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                    <p className="text-xs font-bold text-gray-800 mb-1">{item.user?.name}</p>
                                    <p className="text-sm text-gray-600 leading-tight mb-2">{item.text}</p>
                                    
                                    {item.attachments && item.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-50">
                                            {item.attachments.map((file: any, idx: number) => (
                                                <div key={idx} className="group relative">
                                                    {file.fileType?.startsWith('image/') ? (
                                                        <img src={file.fileUrl} className="h-20 w-20 object-cover rounded-md border cursor-pointer hover:opacity-80" onClick={() => window.open(file.fileUrl, '_blank')} alt="" />
                                                    ) : (
                                                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] bg-gray-100 p-1 rounded hover:bg-gray-200">
                                                            <File size={12} /> {file.fileName.substring(0, 10)}...
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 ml-1">{getRelativeTime(item.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- INPUT --- */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-md border border-dashed border-gray-200">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="relative group">
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} className="h-12 w-12 object-cover rounded border" alt="" />
                                ) : (
                                    <div className="h-12 w-12 flex items-center justify-center bg-white border rounded"><File size={20} /></div>
                                )}
                                <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full group-hover:scale-110">
                                    <XCircle size={18} weight="fill" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:border-blue-400 transition-all">
                    <textarea
                        className="w-full p-3 text-sm outline-none resize-none block"
                        placeholder="Write a comment..."
                        rows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex gap-2 text-gray-400">
                            <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
                            <button onClick={() => fileInputRef.current?.click()} className="hover:text-blue-500 transition-colors">
                                <Paperclip size={18} />
                            </button>
                        </div>
                        <button 
                            onClick={handleSendComment}
                            disabled={!commentText.trim() && selectedFiles.length === 0}
                            className={commentText.trim() || selectedFiles.length > 0 ? 'text-blue-500 hover:scale-110' : 'text-gray-300'}
                        >
                            <PaperPlaneRight size={20} weight="fill" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});