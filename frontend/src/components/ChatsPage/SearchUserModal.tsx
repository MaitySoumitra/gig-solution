import { useState, useMemo } from "react";
import {
  useSearchUsersQuery,
  useSendChatRequestMutation,
  useGetMyChatsQuery,
  useGetIncomingRequestsQuery,
} from "../redux/features/chat/chatApi";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function SearchUserModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const currentUser = useCurrentUser();

  const { data: users } = useSearchUsersQuery(q, {
    skip: q.length < 2,
  });

  const { data: chats } = useGetMyChatsQuery();
  const { data: requests } = useGetIncomingRequestsQuery();

  const [sendRequest] = useSendChatRequestMutation();

  /* ================= FILTER USERS ================= */
  const filteredUsers = useMemo(() => {
    if (!users || !currentUser) return [];

    return users.filter((u) => {
      // ❌ self
      if (u._id === currentUser._id) return false;

      // ❌ already in chat
      const alreadyChat = chats?.some((c: any) =>
        c.members.some((m: any) => m._id === u._id)
      );
      if (alreadyChat) return false;

      // ❌ request already pending (incoming)
      const alreadyRequested = requests?.some(
        (r: any) => r.from._id === u._id
      );
      if (alreadyRequested) return false;

      return true;
    });
  }, [users, chats, requests, currentUser]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-96 rounded-xl p-4 shadow-xl">
        <h3 className="font-semibold mb-3 text-gray-900 font-bold">
          Start Chat
        </h3>

<input
  className="
    w-full
    border border-gray-900
    rounded-full
    px-3 py-2 mb-3
    text-sm text-black
    placeholder-gray-900
    focus:outline-none
    focus:ring-1 focus:ring-black
  "
  placeholder="Search by name or email"
  value={q}
  onChange={(e) => setQ(e.target.value)}
/>


        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredUsers.length === 0 && q.length >= 2 && (
            <p className="text-sm text-gray-400">
              No users available
            </p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50"
            >
              <div className="leading-tight">
                <p className="text-sm font-medium text-gray-900">
                  {u.name}
                </p>
                <p className="text-xs text-gray-500">
                  {u.email}
                </p>
              </div>

              <button
                onClick={() => {
                  sendRequest({ userId: u._id });
                  onClose();
                }}
                className="bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
              >
                Send
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-black"
        >
          Close
        </button>
      </div>
    </div>
  );
}