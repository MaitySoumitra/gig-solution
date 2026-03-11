import { NavLink, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../redux/app/hook"
import { useEffect, useState } from "react"
import { deleteBoard, editBoard, fetchBoard } from "../redux/features/Board/boardSlice"
import { slugify } from '../hooks/slugify'
import {
    House,
    Kanban,
    Users,
    SignOut,
    Plus,
    CaretLeft,
    CaretRight,
    UserCirclePlus,
    ListChecks,
    DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { logoutUser } from "../redux/features/User/login/loginSlice";
import { CreateBoardForm } from "../redux/features/Board/CreateBoardForm"
import AddUserModal from "../redux/features/User/AddUserModal"
interface SidebarProps {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}
export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
    const [showBoard, setShowBoard] = useState<boolean>(false);
    const [createBoard, setCreateBoard] = useState<boolean>(false)
    const [showAddUser, setShowAddUser] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<any>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [boardToEdit, setBoardToEdit] = useState<any>(null)
    const [editName, setEditName] = useState<string>("")

    const navigate = useNavigate()
    const baseRow =
        "flex items-center h-11 px-4 text-sm rounded-md transition-all";
    const active = "bg-black text-white";
    const inactive = "text-black hover:bg-black hover:text-white";

    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user)
    const board = useAppSelector(state => state.board.boards)

    const role = user?.role || "user";
    const dashboardBase = `/${role}/dashboard`;
    useEffect(() => {
        dispatch(fetchBoard())
    }, [dispatch])

    const handleDelete = async (boardId: string) => {
        try {
            await dispatch(deleteBoard({ boardId })).unwrap();
            setTaskToDelete(null);

            // FIX: Redirect to Home/Dashboard after deletion
            navigate(dashboardBase, { replace: true });

        } catch (error) {
            console.error("Delete failed", error);
        }
    };
    const handleEditSubmit = async () => {
        if (!editName.trim()) return;
        try {
            const updatedBoard = await dispatch(editBoard({
                boardId: boardToEdit._id,
                name: editName
            })).unwrap();

            setBoardToEdit(null);
            setEditName("");

            // FIX: Update the URL to the new slug immediately
            const newSlug = slugify(updatedBoard.name);
            navigate(`${dashboardBase}/${newSlug}`, { replace: true });

        } catch (error) {
            console.error("Edit failed", error);
        }
    };
    const handleLogout = async () => {
        await dispatch(logoutUser()).unwrap();
        navigate("/", { replace: true });
    };
    const onClose = () => {
        setCreateBoard(false)
    }
    return (
        < >
            <aside
                className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200
        ${collapsed ? "w-16" : "w-64"}
        transition-all duration-300 flex flex-col z-50`}
            >
                {/* LOGO */}
                <div className="h-14 flex items-center px-4">
                    <div
                        className={`text-black font-bold text-xl ${collapsed ? "mx-auto tracking-widest" : ""
                            }`}
                    >
                        {collapsed ? "ASC" : "Ahaan Software"}
                    </div>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
                    <NavLink
                        to={`${dashboardBase}`}
                        end
                        className={({ isActive }) => `${baseRow} ${isActive ? active : inactive} `}
                    >
                        <div
                            className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""
                                }`}
                        >
                            <House size={18} />
                            {!collapsed && "Home"}
                        </div>
                    </NavLink>
                    <NavLink to={`${dashboardBase}/tasks?scope=${(role === 'admin' || role === 'super-admin') ? 'all' : 'mine'}`}
                        className={({ isActive }) => `${baseRow} ${isActive ? active : inactive} `}>
                        <div
                            className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""
                                }`}
                        >
                            <ListChecks size={18} />
                            {!collapsed &&
                                (role === "admin" || role === "super-admin"
                                    ? "All Tasks"
                                    : "My Tasks")}
                        </div>
                    </NavLink>
                    <div className={`${baseRow} ${inactive}`} >
                        <button
                            onClick={() => setShowBoard((p) => !p)}
                            className="flex items-center gap-3 flex-1 text-left"
                        >
                            <Kanban size={18} />
                            {!collapsed && "Project"}
                        </button>
                        {!collapsed && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCreateBoard(true);
                                }}
                                className="p-1"
                            >
                                <Plus size={14} />
                            </button>
                        )}

                    </div>

                    {showBoard && !collapsed && (
                        <div className="ml-8 space-y-1">
                            {board.map((b) => {
                                const isMenuOpen = openMenuId === b._id;
                                const boardSlug = slugify(b.name);
                                return (
                                    <div key={b._id} className="relative group">
                                        <NavLink
                                            to={`${dashboardBase}/${boardSlug}`}
                                            className={({ isActive }) =>
                                                `block h-9 px-3 text-xs rounded-md flex items-center justify-between transition-colors ${isActive
                                                    ? "bg-gray-400 text-white"
                                                    : "hover:bg-gray-400 hover:text-white text-gray-700"
                                                }`
                                            }
                                        >
                                            <span className="truncate mr-2">{b.name}</span>

                                            {(role === "admin" || role === "super-admin") && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); 
                                                        e.stopPropagation();
                                                        setOpenMenuId(isMenuOpen ? null : b._id);
                                                    }}
                                                    className="rounded-full hover:bg-white hover:text-black p-[2px] transition-colors"
                                                >
                                                    <DotsThreeVerticalIcon size={20} weight="bold" />
                                                </button>
                                            )}
                                        </NavLink>
                                        {isMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setOpenMenuId(null)}
                                                />
                                                <div className="absolute right-0 top-9 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBoardToEdit(b);
                                                            setEditName(b.name);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTaskToDelete(b);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {role === "super-admin" && (
                        <button
                            onClick={() => setShowAddUser(true)}
                            className={`w-full ${baseRow} ${inactive}`}
                        >
                            <div
                                className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""
                                    }`}
                            >
                                <UserCirclePlus size={18} />
                                {!collapsed && "Create User"}
                            </div>
                        </button>
                    )}
                    <NavLink
                        to={`/${role}/dashboard/teams`}
                        className={({ isActive }) =>
                            `${baseRow} ${isActive ? active : inactive}`
                        }
                    >
                        <div
                            className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""
                                }`}
                        >
                            <Users size={18} />
                            {!collapsed && "Teams"}
                        </div>
                    </NavLink>
                    <button
                        onClick={() => setCollapsed((p) => !p)}
                        className="flex items-center h-11 w-full justify-center"
                    >
                        {collapsed ? <CaretRight /> : <CaretLeft />}
                    </button>
                </nav>
                <div className="p-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-black hover:text-red-600 transition"
                    >
                        <SignOut />
                        {!collapsed && "Logout"}
                    </button>
                </div>
            </aside>
            {createBoard && !collapsed && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center"
                    onClick={() => setCreateBoard(false)}
                >
                    <div className="absolute inset-0 bg-black/40" />

                    <div
                        className="relative w-[520px] bg-white rounded-2xl p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CreateBoardForm onClose={onClose} />
                    </div>
                </div>
            )}
            {showAddUser && (
                <AddUserModal onClose={() => setShowAddUser(false)} />
            )}
            {taskToDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">
                            Confirm Delete
                        </h2>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete
                            <span className="font-semibold text-red-600">
                                {" "}{taskToDelete.title}
                            </span>
                            ?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setTaskToDelete(null)}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleDelete(taskToDelete._id)}
                                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {boardToEdit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-800 mb-3">
                            Edit Board Name
                        </h2>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Board Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setBoardToEdit(null)}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleEditSubmit}
                                disabled={!editName.trim()}
                                className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
