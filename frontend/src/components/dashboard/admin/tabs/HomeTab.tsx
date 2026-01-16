import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../../../redux/app/hook";
import { fetchAllTasks } from "../../../redux/features/Task/taskSlice";
import { fetchColumn } from "../../../redux/features/Column/columnSlice";

interface Stats {
    Todo: number;
    InProgress: number;
    Completed: number;
    Delay: number;
    total: number;
    percentage: number;
}

const ProjectDonutChart = ({ stats, size = 110 }: { stats: Stats, size?: number }) => {
    const data = [
        { label: 'Todo', value: stats.Todo, color: '#3B82F6' },
        { label: 'In Progress', value: stats.InProgress, color: '#F59E0B' },
        { label: 'Completed', value: stats.Completed, color: '#10B981' },
        { label: 'Delay', value: stats.Delay, color: '#EF4444' },
    ];

    const center = size / 2;
    const radius = size * 0.35;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    if (stats.total === 0) {
        return (
            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-full" 
                 style={{ width: size, height: size }}>
                <span className="text-[10px] text-gray-400 font-medium">No Tasks</span>
            </div>
        );
    }

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                {data.map((item, index) => {
                    if (item.value === 0) return null;
                    const segmentPercentage = (item.value / stats.total) * 100;
                    const strokeLength = (segmentPercentage / 100) * circumference;
                    const offset = (cumulativeOffset / 100) * circumference;
                    cumulativeOffset += segmentPercentage;

                    return (
                        <circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={size * 0.12}
                            strokeDasharray={`${strokeLength} ${circumference}`}
                            strokeDashoffset={-offset}
                            strokeLinecap={stats.total === item.value ? "butt" : "round"}
                            className="transition-all duration-700"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-800 leading-none">{stats.total}</span>
                <span className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">Tasks</span>
            </div>
        </div>
    );
};

export const HomeTab = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user);
    const boards = useAppSelector(state => state.board.boards);
    const allTasks = useAppSelector(state => state.task.task) || [];
    const columnsByBoard = useAppSelector(state => state.column.columns);

 useEffect(() => {
    dispatch(fetchAllTasks());
    // Only dispatch if the board and its _id exist
    boards.forEach(b => {
        if (b?._id) {
            dispatch(fetchColumn(b._id));
        }
    });
}, [dispatch, boards.length]);

 const calculateStats = (boardId: string): Stats => {
    // 1. Safe filter for board tasks
    const boardTasks = allTasks.filter(t => {
        if (!t || !t.board) return false; // Guard against null tasks/boards
        const id = typeof t.board === 'object' ? (t.board as any)?._id : t.board;
        return String(id) === String(boardId);
    });

    const boardColumns = columnsByBoard[boardId] || [];

    // 2. Safe filter for column counts using Optional Chaining (?.)
    const counts = {
        Todo: boardTasks.filter(t => 
            boardColumns.find(c => c?._id === t?.column)?.name === "Todo"
        ).length,
        InProgress: boardTasks.filter(t => 
            boardColumns.find(c => c?._id === t?.column)?.name === "In Progress"
        ).length,
        Completed: boardTasks.filter(t => 
            boardColumns.find(c => c?._id === t?.column)?.name === "Completed"
        ).length,
        Delay: boardTasks.filter(t => 
            boardColumns.find(c => c?._id === t?.column)?.name === "Delay"
        ).length,
    };

    const total = boardTasks.length;
    const percentage = total > 0 ? Math.round((counts.Completed / total) * 100) : 0;
    return { ...counts, total, percentage };
};

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] p-6 lg:p-10">
            <header className="mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name} 👋</h2>
                <p className="text-gray-500 mt-1">Global project health and task distribution.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {boards.map((board) => {
                    const stats = calculateStats(board._id);
                    return (
                        <div key={board._id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 flex flex-col">
                            {/* Top Section: Title & Chart */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{board.name}</h3>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        {stats.percentage}% Done
                                    </div>
                                </div>
                                <ProjectDonutChart stats={stats} />
                            </div>

                            {/* Middle Section: Linear Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Overall Completion</span>
                                    <span className="text-xs font-black text-gray-700">{stats.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats.percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Bottom Section: Grid of Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <MiniStat label="Todo" count={stats.Todo} color="bg-blue-500" />
                                <MiniStat label="In Progress" count={stats.InProgress} color="bg-amber-500" />
                                <MiniStat label="Completed" count={stats.Completed} color="bg-emerald-500" />
                                <MiniStat label="Delay" count={stats.Delay} color="bg-red-500" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Tiny Helper UI ---
const MiniStat = ({ label, count, color }: { label: string, count: number, color: string }) => (
    <div className="flex flex-col p-3 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
        </div>
        <span className="text-lg font-bold text-gray-800">{count}</span>
    </div>
);