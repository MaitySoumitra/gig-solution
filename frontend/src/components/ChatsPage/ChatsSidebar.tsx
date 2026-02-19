import { useState, useMemo, useEffect } from "react";
import {
  useGetIncomingRequestsQuery,
  useAcceptChatRequestMutation,
  useGetMyChatsQuery,
  useMarkSeenMutation,
} from "../redux/features/chat/chatApi";
import { setActiveChat } from "../redux/features/chat/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { RootState } from "../redux/app/store";
import SearchUserModal from "./SearchUserModal";
import { ChatsCircle, Plus } from "@phosphor-icons/react";
import { getAvatarColor } from "../utils/avatarColor";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
 
// 🟢 STATUS FEATURE
import StatusPicker from "./StatusPicker";
import { STATUS_META, type UserStatus } from "../utils/userStatus";
import { socket } from "../services/socket";
 
export default function ChatsSidebar() {
  const dispatch = useDispatch();
  const currentUser = useCurrentUser();
  const onlineUsers = useOnlineUsers();
 
  const activeChat = useSelector(
    (state: RootState) => state.chat.activeChat
  );
 
  const { data: requests } = useGetIncomingRequestsQuery();
  const { data: chats } = useGetMyChatsQuery();
 
  const [acceptRequest] = useAcceptChatRequestMutation();
  const [markSeen] = useMarkSeenMutation();
  const [showSearch, setShowSearch] = useState(false);
 
  /* ================= STATUS STATE ================= */
  const [showStatus, setShowStatus] = useState(false);
  const [myStatus, setMyStatus] = useState<UserStatus>(null);
  const [userStatuses, setUserStatuses] = useState<
    Record<string, UserStatus>
  >({});
 
  /* ================= SOCKET STATUS SYNC ================= */
  useEffect(() => {
    socket.on("all-status", (list: any[]) => {
      const map: Record<string, UserStatus> = {};
      list.forEach(({ userId, status }) => {
        map[userId] = status;
      });
      setUserStatuses(map);
 
      if (currentUser?._id && map[currentUser._id]) {
        setMyStatus(map[currentUser._id]);
      }
    });
 
    socket.on("status-updated", ({ userId, status }) => {
      setUserStatuses((prev) => ({
        ...prev,
        [userId]: status,
      }));
 
      if (userId === currentUser?._id) {
        setMyStatus(status);
      }
    });
 
    return () => {
      socket.off("all-status");
      socket.off("status-updated");
    };
  }, [currentUser?._id]);
 
  const updateStatus = (status: UserStatus) => {
    if (!currentUser?._id) return;
 
    setMyStatus(status);
    socket.emit("set-status", {
      userId: currentUser._id,
      status,
    });
  };
 
  if (!currentUser) {
    return (
      <aside className="w-80 bg-black text-gray-400 flex items-center justify-center">
        Loading...
      </aside>
    );
  }
 
  /* ================= UNIQUE CHAT LIST ================= */
  const uniqueChats = useMemo(() => {
    if (!chats) return [];
 
    const map = new Map<string, any>();
    chats.forEach((chat) => {
      const other = chat.members.find(
        (m: any) => m._id !== currentUser._id
      );
      if (other && !map.has(other._id)) {
        map.set(other._id, chat);
      }
    });
 
    return Array.from(map.values());
  }, [chats, currentUser._id]);
 
  return (
    <aside className="w-80 bg-black text-white flex flex-col relative">
      {/* ===== HEADER ===== */}
      <div className="p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <ChatsCircle size={22} weight="fill" />
          <h2 className="font-bold">ASC Conversation</h2>
        </div>
 
        <button
          onClick={() => setShowSearch(true)}
          className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center"
        >
          <Plus size={16} weight="bold" />
        </button>
      </div>
 
      {/* ===== REQUESTS ===== */}
      {requests && requests.length > 0 && (
        <div className="px-2 py-2 border-b border-gray-800">
          {requests.map((r) => {
            const avatarColor = getAvatarColor(r.from.name);
 
            return (
              <div
                key={r._id}
                className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-900 mb-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full text-white flex items-center justify-center font-semibold"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {r.from.name.charAt(0).toUpperCase()}
                  </div>
 
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{r.from.name}</p>
                    <p className="text-xs text-gray-400">{r.from.email}</p>
                  </div>
                </div>
 
                <button
                  onClick={() =>
                    acceptRequest({ requestId: r._id })
                  }
                  className="bg-white text-black text-xs px-3 py-1 rounded-full"
                >
                  Accept
                </button>
              </div>
            );
          })}
        </div>
      )}
 
      {/* ===== CHAT LIST ===== */}
      <div className="flex-1 overflow-y-auto">
        {uniqueChats.map((chat) => {
          const other = chat.members.find(
            (m: any) => m._id !== currentUser._id
          );
          if (!other) return null;
 
          const avatarColor = getAvatarColor(other.name);
          const isOnline = onlineUsers.includes(other._id);
          const unreadCount =
            chat.unreadCount ??
            chat.unreadCountMap?.[currentUser._id] ??
            0;
 
          const userStatus = userStatuses[other._id];
 
          return (
            <div
              key={chat._id}
              onClick={() => {
                dispatch(setActiveChat(chat));
                if (unreadCount > 0) markSeen(chat._id);
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                activeChat?._id === chat._id
                  ? "bg-gray-800"
                  : "hover:bg-gray-900"
              }`}
            >
              {/* AVATAR */}
              <div
                className="relative h-10 w-10 rounded-full text-white flex items-center justify-center font-semibold"
                style={{ backgroundColor: avatarColor }}
              >
                {other.name.charAt(0).toUpperCase()}
 
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                )}
              </div>
 
              {/* NAME + EMAIL + STATUS */}
              <div className="flex items-center flex-1 justify-between min-w-0">
                <div className="leading-tight min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {other.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {other.email}
                  </p>
                </div>
 
                {userStatus && (
                  <div
                    className="ml-3 flex-shrink-0 text-[20px] drop-shadow select-none"
                    title={STATUS_META[userStatus].label}
                  >
                    {STATUS_META[userStatus].emoji}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
 
      {/* ===== CURRENT USER ===== */}
      <div
        className="border-t border-gray-800 p-4 flex items-center gap-3 cursor-pointer"
        onClick={() => setShowStatus(true)}
      >
        <div
          className="h-10 w-10 rounded-full text-white flex items-center justify-center font-semibold"
          style={{ backgroundColor: getAvatarColor(currentUser.name) }}
        >
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
 
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentUser.email}
            </p>
          </div>
 
          {myStatus && (
            <div
              className="ml-3 text-[20px] drop-shadow select-none"
              title={STATUS_META[myStatus].label}
            >
              {STATUS_META[myStatus].emoji}
            </div>
          )}
        </div>
      </div>
 
      {/* ===== STATUS PICKER ===== */}
      {showStatus && (
        <StatusPicker
          onSelect={(s) => {
            updateStatus(s);
            setShowStatus(false);
          }}
          onClose={() => setShowStatus(false)}
        />
      )}
 
      {showSearch && (
        <SearchUserModal onClose={() => setShowSearch(false)} />
      )}
    </aside>
  );
}
 
 