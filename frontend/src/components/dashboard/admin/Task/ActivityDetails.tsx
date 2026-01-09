import { At, Paperclip, PaperPlaneRight } from "@phosphor-icons/react";
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
    const diff = Math.floor((now - before) / 1000); // difference in seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 84600)}d ago`;
    
    // Fallback to a simple date string for older items
    return new Date(date).toLocaleDateString();
};
export const ActivityDetails = ({ editedTask }: ActivityDetailsProps) => {
    const [commentText, setCommentText] = useState("");
    const boardDetails = useContext(BoardContext);
    const addComment = boardDetails?.addComment;

    const handleSendComment = async () => {
        if (!commentText.trim() || !editedTask._id) return;
        await addComment?.(editedTask._id, commentText);
        setCommentText("");
    };

    return (
        <div className="bg-white border-l border-gray-200 shadow-sm flex flex-col h-full">
            <h3 className="font-medium text-gray-600 p-4 border-b border-gray-100 uppercase text-xs tracking-widest">
                Activity
            </h3>

            {/* Feed Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                {[
                    ...(editedTask.activityLog?.map(a => ({ ...a, type: 'activity' })) || []),
                    ...(editedTask.comments?.map(c => ({ ...c, type: 'comment' })) || [])
                ]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .reverse() // Showing newest at the top is usually better for activity feeds
                .map((item: any, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {item.type === 'activity' ? (
                            <div className="flex items-start gap-2 text-xs text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <p>
                                    <span className="font-bold text-gray-700">{item.user?.name}</span>
                                    {" "}{item.action}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <p className="text-xs font-bold text-gray-800 mb-1">{item.user?.name}</p>
                                <p className="text-sm text-gray-600 leading-tight">{item.text}</p>
                            </div>
                        )}
                        {/* Custom Time Helper used here */}
                        <span className="text-[10px] text-gray-400 ml-3">
                            {getRelativeTime(item.createdAt)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <textarea
                        className="w-full p-3 text-sm outline-none resize-none block"
                        placeholder="Write a comment..."
                        rows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-gray-600"><Paperclip size={18} /></button>
                            <button className="text-gray-400 hover:text-gray-600"><At size={18} /></button>
                        </div>
                        <button 
                            onClick={handleSendComment}
                            className={`${commentText.trim() ? 'text-blue-500' : 'text-gray-300'}`}
                        >
                            <PaperPlaneRight size={20} weight="fill" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};