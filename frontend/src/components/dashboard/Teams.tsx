import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { getAvatarColor } from "../utils/avatarColor";
import { STATUS_META } from "../utils/userStatus";
import EditUserModal from "../redux/features/User/EditUserModal";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { useAppSelector } from "../redux/app/hook";
import axiosClient from "../api/axiosClient";

import type { User } from "../types/allType";

/* ================= ROLE STYLE ================= */

const getRoleStyle = (role: string) => {
  switch (role?.toLowerCase()) {
    case "super-admin":
      return "bg-violet-100 text-violet-700";

    case "admin":
      return "bg-blue-100 text-blue-700";

    case "developer":
      return "bg-green-100 text-green-700";

    case "designer":
      return "bg-pink-100 text-pink-700";

    default:
      return "bg-cyan-100 text-cyan-700";
  }
};

/* ================= DATE FORMAT ================= */

const formatDateTime = (date?: string) => {
  if (!date) return "—";

  const d = new Date(date);

  return d.toLocaleString();
};

/* ================= COMPONENT ================= */

const Teams = () => {

  const [editUser, setEditUser] = useState<User | null>(null);
  const { data, isLoading, error, refetch } = useUsers();

  const onlineUsers = useOnlineUsers();

  const currentUser = useAppSelector((state) => state.login.user);

  /* ================= DELETE USER ================= */

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/api/users/delete/${id}`, {
        withCredentials: true,
      });

      alert("User deleted successfully");

      refetch();
    } catch (error: any) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to delete user");
    }
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <div className="p-6 text-gray-500">
        Loading team members…
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error instanceof Error) {
    return (
      <div className="p-6 text-red-500">
        {error.message}
      </div>
    );
  }

  /* ================= EMPTY ================= */

  if (!data?.users?.length) {
    return (
      <div className="p-6 text-gray-400">
        No team members found
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}

      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-black font-bold">
            Team Members
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Manage and view all members of your team
          </p>
        </div>

        <div className="text-white bg-black px-5 py-2 rounded-full border border-black/10 shadow-sm">
          Total : {data?.total}
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>

              <th className="px-6 py-4 text-left">Email</th>

              <th className="px-6 py-4 text-center">Role</th>

              <th className="px-6 py-4 text-center">Phone</th>

              <th className="px-6 py-4 text-center">Created</th>

              <th className="px-6 py-4 text-center">Status</th>

              {currentUser?.role === "super-admin" && (
                <th className="px-6 py-4 text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.users.map((user: User, index: number) => {
              const isOnline = onlineUsers.includes(user._id);

              const statusMeta =
                user.status && STATUS_META[user.status];

              return (
                <tr
                  key={user._id}
                  className={`${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-100"
                  } hover:bg-gray-100`}
                >
                  {/* ================= USER ================= */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">

                      {/* AVATAR */}

                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{
                            backgroundColor:
                              getAvatarColor(user.name),
                          }}
                        >
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        {/* ONLINE DOT */}

                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>

                      <div>
                        <span className="text-xs font-bold">
                          {user.name}
                        </span>

                        <div className="text-xs text-gray-400">
                          ID: {user._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ================= EMAIL ================= */}

                  <td className="px-6 py-4 text-gray-900 text-[13px] font-semibold">
                    {user.email}
                  </td>

                  {/* ================= ROLE ================= */}

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold capitalize text-[11px] ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* ================= PHONE ================= */}

                  <td className="px-6 py-4 text-center text-gray-600">
                    {user.phone || "—"}
                  </td>

                  {/* ================= CREATED ================= */}

                  <td className="px-6 py-4 text-center text-gray-500">
                    {formatDateTime(user.createdAt)}
                  </td>

                  {/* ================= STATUS ================= */}

                  <td className="px-6 py-4 text-center">
                    {statusMeta ? (
                      <span className="flex items-center justify-center">
                        {(() => {
                          const Icon =
                            statusMeta.icon;

                          const gradientId =
                            `rainbow-${user._id}`;

                          return (
                            <svg
                              width="24"
                              height="24"
                            >
                              <defs>
                                <linearGradient
                                  id={gradientId}
                                  x1="0%"
                                  y1="12%"
                                  x2="100%"
                                  y2="36%"
                                >
                                  <stop
                                    offset="50%"
                                    stopColor="#e69200"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#f9d056"
                                  />
                                </linearGradient>
                              </defs>

                              <foreignObject
                                width="24"
                                height="24"
                              >
                                <Icon
                                  size={24}
                                  weight="fill"
                                  style={{
                                    fill: `url(#${gradientId})`,
                                  }}
                                />
                              </foreignObject>
                            </svg>
                          );
                        })()}
                      </span>
                    ) : (
                      <b className="text-xs text-green-700">
                        ---
                      </b>
                    )}
                  </td>

                  {/* ================= ACTIONS ================= */}

                  {currentUser?.role ===
                    "super-admin" && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">

                        {/* EDIT */}

                        <button
                          onClick={() => setEditUser(user)}
                          className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                        >
                          <PencilSimple
                            size={20}
                            weight="light"
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              user._id
                            )
                          }
                          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                        >
                          <Trash
                            size={20}
                            weight="light"
                          />
                        </button>

                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editUser && (
  <EditUserModal
    user={editUser}
    onClose={() => setEditUser(null)}
    onUpdated={() => {
      setEditUser(null);
      refetch();
    }}
  />
)}
    </div>
  );
};

export default Teams;