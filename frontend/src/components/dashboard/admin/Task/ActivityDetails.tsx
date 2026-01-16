import { At, Paperclip, PaperPlaneRight, CaretDown, CaretUp } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { BoardContext } from "../../../context/board/BoardContext";
import type { Task } from "../../../types/allType";

interface ActivityDetailsProps {
    editedTask: Partial<Task>;
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

export const ActivityDetails = ({ editedTask }: ActivityDetailsProps) => {
    const [commentText, setCommentText] = useState("");
    // Independent "Show All" states
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    
    const boardDetails = useContext(BoardContext);
    const addComment = boardDetails?.addComment;

    const handleSendComment = async () => {
        if (!commentText.trim() || !editedTask._id) return;
        await addComment?.(editedTask._id, commentText);
        setCommentText("");
    };

    // Data Preparation
    const activities = [...(editedTask.activityLog || [])].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const comments = [...(editedTask.comments || [])].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Logic for slicing
    const displayedActivities = showAllActivity ? activities : activities.slice(0, 3);
    const displayedComments = showAllComments ? comments : comments.slice(0, 3);

    return (
        <div className="bg-white border-l border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            <h3 className="font-medium text-gray-600 p-4 border-b border-gray-100 uppercase text-xs tracking-widest shrink-0">
                Update Feed
            </h3>

            <div className="flex-grow flex flex-col overflow-hidden">
                
                {/* --- ACTIVITY SECTION --- */}
                <div className="flex flex-col border-b border-gray-100 max-h-[50%] p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Recent Activity</span>
                        {activities.length > 3 && (
                            <button 
                                onClick={() => setShowAllActivity(!showAllActivity)}
                                className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5"
                            >
                                {showAllActivity ? 'Hide' : `Show All (${activities.length})`}
                                {showAllActivity ? <CaretUp /> : <CaretDown />}
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                        {displayedActivities.map((item, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex items-start gap-2 text-xs text-gray-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <p><span className="font-bold text-gray-700">{item.user?.name}</span> {item.action}</p>
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
                            <button 
                                onClick={() => setShowAllComments(!showAllComments)}
                                className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5"
                            >
                                {showAllComments ? 'Hide' : `Show All (${comments.length})`}
                                {showAllComments ? <CaretUp /> : <CaretDown />}
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                        {displayedComments.map((item, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                    <p className="text-xs font-bold text-gray-800 mb-1">{item.user?.name}</p>
                                    <p className="text-sm text-gray-600 leading-tight">{item.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 ml-1">{getRelativeTime(item.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- INPUT FIXED AT BOTTOM --- */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
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
                            <button className="hover:text-gray-600"><Paperclip size={18} /></button>
                            <button className="hover:text-gray-600"><At size={18} /></button>
                        </div>
                        <button 
                            onClick={handleSendComment}
                            disabled={!commentText.trim()}
                            className={commentText.trim() ? 'text-blue-500 hover:scale-110' : 'text-gray-300'}
                        >
                            <PaperPlaneRight size={20} weight="fill" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};