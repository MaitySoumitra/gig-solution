import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks } from "../../redux/features/Task/taskSlice";
import { fetchColumn } from "../../redux/features/Column/columnSlice";
import { AllTable } from "../Home/AllTable";
import { getAvatarColor } from "../../utils/avatarColor";
import { getColumnColor } from "../../utils/columnColors";

interface Stats {
  Todo: number;
  InProgress: number;
  Completed: number;
  Delay: number;
  total: number;
  percentage: number;
}

const ProjectDonutChart = ({
  stats,
  size = 110,
}: {
  stats: Stats;
  size?: number;
}) => {
  const data = [
    { label: "Todo", value: stats.Todo, color: "#3B82F6" },
    { label: "In Progress", value: stats.InProgress, color: "#F59E0B" },
    { label: "Completed", value: stats.Completed, color: "#10B981" },
    { label: "Delay", value: stats.Delay, color: "#EF4444" },
  ];

  const center = size / 2;
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  if (stats.total === 0) {
    return (
      <div
        className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-full"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] text-gray-400 font-medium">
          No Tasks
        </span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
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
        <span className="text-lg font-bold text-gray-800 leading-none">
          {stats.total}
        </span>
        <span className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">
          Tasks
        </span>
      </div>
    </div>
  );
};

export const HomeTab = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.login.user);
  const boards = useAppSelector((state) => state.board.boards);
  const allTasks = useAppSelector((state) => state.task.task) || [];
  const columnsByBoard = useAppSelector((state) => state.column.columns);

  useEffect(() => {
    dispatch(getTasks());
    boards.forEach((b) => {
      if (b?._id) {
        dispatch(fetchColumn(b._id));
      }
    });
  }, [dispatch, boards.length]);

  const calculateStats = (boardId: string): Stats => {
    const boardTasks = allTasks.filter((t) => {
      if (!t || !t.board) return false;
      const taskId = t.board._id ? String(t.board._id) : String(t.board);
      return taskId === String(boardId);
    });

    const boardColumns = columnsByBoard[boardId] || [];

    const getCountByStatus = (statusName: string) => {
      return boardTasks.filter((t) => {
        if (!t.column) return false;

        const columnName = t.column.name
          ? t.column.name
          : boardColumns.find((c) => c?._id === t?.column)?.name;

        return columnName === statusName;
      }).length;
    };

    const Todo = getCountByStatus("Todo");
    const InProgress = getCountByStatus("In Progress");
    const Completed = getCountByStatus("Completed");
    const Delay = getCountByStatus("Delay");

    const total = boardTasks.length;
    const percentage =
      total > 0 ? Math.round((Completed / total) * 100) : 0;

    return { Todo, InProgress, Completed, Delay, total, percentage };
  };

  return (
    <div className="min-h-screen w-full p-6 lg:p-10">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h2>

        <p
          className="mt-1 font-semibold capitalize bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(120deg, ${getAvatarColor(
              user?.name || "User"
            )}, #000000)`,
          }}
        >
          Welcome to your dashboard {user?.name}. Here’s a quick overview of
          your projects, tasks, and team performance.
        </p>
      </header>

      <AllTable />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">
        {boards.map((board) => {
          const stats = calculateStats(board._id);

          return (
            <div
              key={board._id}
              className="bg-white rounded-[2rem] p-7 shadow-xl border-t-8 border-gray-900 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
                    {board.name}
                  </h3>

                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {stats.percentage}% Done
                  </div>
                </div>

                <ProjectDonutChart stats={stats} />
              </div>

              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Overall Completion
                  </span>
                  <span className="text-xs font-black text-gray-700">
                    {stats.percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <MiniStat label="Todo" count={stats.Todo} />
                <MiniStat label="In Progress" count={stats.InProgress} />
                <MiniStat label="Completed" count={stats.Completed} />
                <MiniStat label="Delay" count={stats.Delay} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ✅ MiniStat (Fully Controlled by utils)

const MiniStat = ({
  label,
  count,
}: {
  label: string;
  count: number;
}) => {
  const colors = getColumnColor(label);

  return (
    <div
      className={`flex flex-col p-3 shadow-md rounded-2xl ${colors.bg} border ${colors.border}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.header}`} />
        <span
          className={`text-[10px] font-bold uppercase tracking-tight ${colors.text}`}
        >
          {label}
        </span>
      </div>
      <span className={`text-lg font-bold ${colors.text}`}>
        {count}
      </span>
    </div>
  );
};