import { useSelector } from "react-redux";
import type { RootState } from "../redux/app/store";
import { useGetMessagesQuery } from "../redux/features/chat/chatApi";
import ChatsInput from "./ChatsInput";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ChatHeader from "./ChatHeader";

/* 🔧 BACKEND BASE URL */
const API_BASE = import.meta.env.VITE_API_URL;

export default function ChatsWindow() {
  const conversationId = useSelector(
    (state: RootState) => state.chat.conversationId
  );

  const activeChat = useSelector(
    (state: RootState) => state.chat.activeChat
  );

  const currentUser = useCurrentUser();

  const { data: messages } = useGetMessagesQuery(conversationId!, {
    skip: !conversationId,
  });

  if (!conversationId || !activeChat || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = activeChat.members.find(
    (m: any) => m._id !== currentUser._id
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 relative">
      {/* 🔝 CHAT HEADER */}
      {otherUser && <ChatHeader user={otherUser} />}

      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-28">
        {messages?.map((m: any) => {
          const isMe = m.sender._id === currentUser._id;

          return (
            <div
              key={m._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[65%]
                  px-3 py-2
                  rounded-2xl
                  text-sm
                  ${isMe
                    ? "bg-black text-white rounded-br-sm"
                    : "bg-gray-200 text-gray-900 rounded-bl-sm"}
                `}
              >
                {/* 🖼 IMAGE MESSAGE */}
                {m.file?.url && (
                  <img
                    src={
                      m.file.url.startsWith("http")
                        ? m.file.url
                        : `${API_BASE}${m.file.url}`
                    }
                    alt="chat"
                    className="rounded-lg max-h-64 mb-2 object-contain"
                  />
                )}

                {/* 📝 TEXT MESSAGE */}
                {m.text && m.text.trim() && (
                  <p className="break-words">{m.text}</p>
                )}

                {/* ⏱ TIME */}
                <div className="text-[10px] mt-1 opacity-70 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⌨️ INPUT */}
      <ChatsInput conversationId={conversationId} />
    </div>
  );
}
