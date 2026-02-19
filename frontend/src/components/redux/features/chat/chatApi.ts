import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Message, Conversation, ChatRequest, User } from "./chatType";

/* 🔥 BaseQuery */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery,
  tagTypes: ["Chats", "Requests", "Messages"],

  endpoints: (builder) => ({
    /* ================= CHAT ================= */

    accessChat: builder.mutation<Conversation, { userId: string }>({
      query: (body) => ({
        url: "/api/chat/access",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),

    getMessages: builder.query<Message[], string>({
      query: (conversationId) =>
        `/api/chat/messages/${conversationId}`,
      providesTags: (_r, _e, id) => [
        { type: "Messages", id },
      ],
    }),

    sendMessage: builder.mutation<Message, FormData>({
      query: (formData) => ({
        url: "/api/chat/message",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Messages", id: arg.get("conversationId") as string },
      ],
    }),

    markSeen: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/api/chat/seen/${conversationId}`,
        method: "PUT",
      }),
    }),

    /* ================= 🔍 SEARCH USERS ================= */

    searchUsers: builder.query<User[], string>({
      query: (q) => `/api/chat/search?q=${q}`,
    }),

    /* ================= 🔥 CHAT REQUEST ================= */

    sendChatRequest: builder.mutation<
      { message: string },
      { userId: string }
    >({
      query: (body) => ({
        url: "/api/chat-request/send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Requests"],
    }),

    getIncomingRequests: builder.query<ChatRequest[], void>({
      query: () => "/api/chat-request/incoming",
      providesTags: ["Requests"],
    }),

    acceptChatRequest: builder.mutation<
      Conversation,
      { requestId: string }
    >({
      query: ({ requestId }) => ({
        url: `/api/chat-request/accept/${requestId}`,
        method: "POST",
      }),
      invalidatesTags: ["Chats", "Requests"],
    }),

    getMyChats: builder.query<Conversation[], void>({
      query: () => "/api/chat/my-chats",
      providesTags: ["Chats"],
    }),
  }),
});

export const {
  /* CHAT */
  useAccessChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkSeenMutation,

  /* REQUEST */
  useSearchUsersQuery,
  useSendChatRequestMutation,
  useGetIncomingRequestsQuery,
  useAcceptChatRequestMutation,
  useGetMyChatsQuery,
} = chatApi;
