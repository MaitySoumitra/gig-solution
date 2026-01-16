import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../redux/app/hook";
import { toggleTimer } from "../../../redux/features/Task/taskSlice";
import { Play, Pause, WarningCircle } from "@phosphor-icons/react";

interface TimerProps {
    taskId: string;
    dueDate?: string;
    estimatedTime?: number; // Added this to know the 100% limit
    timeData?: {
        isRunning: boolean;
        activeStartTime: string | null;
        totalLoggedTime: number;
        delay: number;
    };
}

export const Timer = ({ taskId, timeData, dueDate, estimatedTime = 0 }: TimerProps) => {
    const dispatch = useAppDispatch();
    const [elapsedSinceStart, setElapsedSinceStart] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (timeData?.isRunning && timeData?.activeStartTime) {
            interval = setInterval(() => {
                const now = new Date().getTime();
                const start = new Date(timeData.activeStartTime!).getTime();
                setElapsedSinceStart(now - start);
            }, 1000);
        } else {
            setElapsedSinceStart(0);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [timeData?.isRunning, timeData?.activeStartTime]);

    const formatTime = (ms: number) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${h}h ${m}m ${s}s`;
    };

    // 1. Calculate Total Raw Time
    const totalMs = (timeData?.totalLoggedTime || 0) + elapsedSinceStart;
    const goalMs = estimatedTime * 3600000;

    // 2. Calculate "Effective" Time Logged (Capped at 100% of goal)
    // This ensures the main counter represents progress toward the goal
    const cappedLoggedTime = goalMs > 0 ? Math.min(totalMs, goalMs) : totalMs;

    // 3. Calculate Live Delay
    let liveDelay = timeData?.delay || 0;

    // A: Check for Overtime Delay (Exceeding the hourly goal)
    if (goalMs > 0 && totalMs > goalMs) {
        liveDelay += (totalMs - goalMs);
    }

    // B: Check for Deadline Delay (Exceeding the calendar date)
    if (timeData?.isRunning && dueDate && timeData.activeStartTime) {
        const deadline = new Date(dueDate).getTime();
        const now = new Date().getTime();
        if (now > deadline) {
            const start = new Date(timeData.activeStartTime).getTime();
            const currentSessionDelay = start > deadline ? elapsedSinceStart : now - deadline;
            // We only add this if it's not already covered by the overtime delay
            if (totalMs <= goalMs) {
                liveDelay += currentSessionDelay;
            }
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col items-start px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        {totalMs > goalMs && goalMs > 0 ? "Goal Reached" : "Time Logged"}
                    </span>
                    <span className={`font-mono font-bold text-sm tabular-nums ${totalMs > goalMs && goalMs > 0 ? "text-emerald-600" : "text-gray-800"}`}>
                        {/* Display the capped time if you want the counter to stop at 100% */}
                        {formatTime(cappedLoggedTime)}
                    </span>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleTimer({ taskId }));
                    }}
                    className={`p-2 rounded-lg transition-all ${
                        timeData?.isRunning 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                >
                    {timeData?.isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                </button>
            </div>

            {/* Delay Indicator - Shows when over goal OR over deadline */}
            {liveDelay > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-lg animate-pulse">
                    <WarningCircle size={14} className="text-rose-600" weight="fill" />
                    <span className="text-[11px] font-bold text-rose-700">
                        OVERTIME: {formatTime(liveDelay)}
                    </span>
                </div>
            )}
        </div>
    );
};