import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../redux/app/hook";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markAsRead,
} from "../redux/features/notifications/notificationSlice";
import {
  MagnifyingGlass,
  Bell,
  Chats,
  Gear,
} from "@phosphor-icons/react";

import { getAvatarColor } from "../utils/avatarColor"; // ✅ IMPORT FROM UTILS

export const Topbar = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.login.user);
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* 🔥 Single Avatar Color Source */
  const avatarBgColor = getAvatarColor(user?.name || "User");

  /* ============================= */
  /* Notification Date Formatter   */
  /* ============================= */
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    if (isToday)
      return `Today at ${date.toLocaleTimeString([], timeOptions)}`;
    if (isYesterday)
      return `Yesterday at ${date.toLocaleTimeString([], timeOptions)}`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...timeOptions,
    });
  };

  /* ============================= */
  /* Fetch Notifications           */
  /* ============================= */
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  /* ============================= */
  /* Close dropdown on outside click */
  /* ============================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      dispatch(markAsRead(id));
    }
  };

  const role = user?.role;

  const openChatInNewTab = () => {
    if (!role) return;
    const chatPath = `/${role}/dashboard/chats`;

    window.open(
      `${window.location.origin}${chatPath}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <header className="sticky top-0 z-40 h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-100">
      
      {/* ================= SEARCH ================= */}
      <div className="flex items-center gap-3 w-[420px] max-w-full">
        <MagnifyingGlass size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search boards, tasks, docs..."
          className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex items-center gap-5">

        {/* CHAT */}
        <button
          onClick={openChatInNewTab}
          className="relative text-gray-500 hover:text-black transition"
        >
          <Chats size={20} />
        </button>

        {/* ================= NOTIFICATIONS ================= */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative text-gray-500 hover:text-black transition p-1"
          >
            <Bell size={20} />

            {/* 🔥 Avatar Based Badge */}
            {unreadCount > 0 && (
              <span
                className="absolute -top-2 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-[10px] text-white font-bold border-2 border-white"
                style={{ backgroundColor: avatarBgColor }}
              >
                {unreadCount}
              </span>
            )}
          </button>

{isOpen && (
  <div className="absolute right-0 mt-4 w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]  overflow-hidden">

    {/* HEADER */}
    <div className="px-5 py-4 flex justify-between items-center bg-[#000]">
      <h3 className="font-semibold text-gray-50 text-sm">
        Notifications
      </h3>

      <button
        className="text-xs font-semibold transition hover:opacity-80"
        style={{ color: avatarBgColor }}
        onClick={() => dispatch(markAllNotificationsAsRead())}
      >
        Mark all as read
      </button>
    </div>

    {/* LIST */}
    <div
      className="
        max-h-[420px]
        overflow-y-auto
        overflow-x-hidden
        scrollbar-hide
      "
    >
      {notifications.length > 0 ? (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() =>
              handleNotificationClick(n._id, n.isRead)
            }
            className={`px-5 py-4 cursor-pointer transition-all duration-200 flex gap-4 items-start
              ${!n.isRead ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"}
            `}
          >
            {/* AVATAR */}
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{
                backgroundColor: getAvatarColor(
                  n.sender?.name || "U"
                ),
              }}
            >
              {n.sender?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* CONTENT */}
            <div className="flex flex-col flex-1 pr-4">
              <p className="text-sm text-gray-800 leading-snug break-words">
                <span className="font-semibold text-black">
                  {n.sender?._id === user?._id
                    ? "You"
                    : n.sender?.name}
                </span>{" "}
                {n.action}
              </p>

              {n.task && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {n.task.title}
                </p>
              )}

              <p className="text-[11px] text-gray-400 mt-2">
                {formatNotificationDate(n.createdAt)}
              </p>
            </div>

            {/* UNREAD DOT FIXED POSITION */}
            {!n.isRead && (
              <div className="flex items-center pt-1">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: avatarBgColor }}
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="py-12 text-center text-gray-400 text-sm">
          All caught up 🎉
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {/* SETTINGS */}
        <button className="text-gray-500 hover:text-black transition">
          <Gear size={20} />
        </button>

        {/* ================= USER PROFILE ================= */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer group">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: avatarBgColor }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="text-sm leading-tight hidden sm:block">
            <p className="font-bold text-black">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-gray-500 font-medium capitalize">
              {user?.role || "member"}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};