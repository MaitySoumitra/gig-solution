import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/app/hook";
import { fetchAllTasks } from "../../../redux/features/Task/taskSlice"; 

export const HomeTab = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user);
    const boards = useAppSelector(state => state.board.boards);
    const allTasks = useAppSelector(state => state.task.task) || []; // Fallback to empty array
    const loading = useAppSelector(state => state.task.loading);
console.log("DEBUG - Boards Count:", boards.length);
    console.log("DEBUG - Tasks Data:", allTasks);
    useEffect(() => {
        // This triggers the API call to fill state.task.task
        dispatch(fetchAllTasks());
    }, [dispatch]);

    const calculateBoardProgress = (boardId: string) => {
        const boardTasks = allTasks.filter(t => {
            // Normalize ID comparison to strings
            const tBoardId = typeof t.board === 'object' ? (t.board as any)._id : t.board;
            return String(tBoardId) === String(boardId);
        });

        if (boardTasks.length === 0) return 0;
        const totalSum = boardTasks.reduce((acc, t) => acc + (t.progress || 0), 0);
        return Math.round(totalSum / boardTasks.length);
    };

    if (loading === 'pending' && allTasks.length === 0) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="flex h-screen w-full bg-gray-50"> 
            <div className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-8">Welcome 👋 {user?.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((boardItem) => {
                        const progress = calculateBoardProgress(boardItem._id);
                        const boardTasksCount = allTasks.filter(t => {
                            const id = typeof t.board === 'object' ? (t.board as any)._id : t.board;
                            return String(id) === String(boardItem._id);
                        }).length;

                        return (
                            <div key={boardItem._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-xl mb-2">{boardItem.name}</h3>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">{boardTasksCount} Tasks</span>
                                    <span className="font-bold text-blue-600">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};