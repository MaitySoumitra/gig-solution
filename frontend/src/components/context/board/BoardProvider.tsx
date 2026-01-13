import { type ReactNode, useEffect, useMemo } from "react"
import { BoardContext } from "./BoardContext"
import { useAppDispatch, useAppSelector } from "../../redux/app/hook"
import { useParams } from "react-router-dom"
import { slugify } from "../../hooks/slugify"
import { addMember, fetchBoard } from "../../redux/features/Board/boardSlice"
import type { Board, Task } from "../../types/allType"
import { addColumn, deleteColumn, fetchColumn } from "../../redux/features/Column/columnSlice"
import { addComment, clearTasks, deleteTask, fetchTasksForColumn, moveTask, updateProgress, updateTask } from "../../redux/features/Task/taskSlice"

interface BoardProviderProps {
  board: Board | null
  loading: boolean
  task:Task[]
  getTaskByColumn: (columnId: string) => Task[]
  addMember: (memberId: string) => void
  addColumn: (name: string) => void
  deleteColumn: (columnId: string) => void
  deleteTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, toColumnId: string, toPosition: number) => void
  addComment: (taskId: string, text: string) => void
  updateProgress: (taskId: string, progress: number) => void
}


export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()
  const boards = useAppSelector(state => state.board.boards)
  const tasks = useAppSelector(state => state.task.task)
  const columns = useAppSelector(state => state.column.columns)

  const isBoardIsLoading = useAppSelector(state => state.board.loading === "pending")
  const isTaskIsLoading = useAppSelector(state => state.task.loading === "pending")
  const globalLoading = isBoardIsLoading || isTaskIsLoading

  const { boardSlug } = useParams()



  const currentBoard = useMemo(() => {
    if (boardSlug) {
      return boards.find((board) => slugify(board.name) === boardSlug) || null;
    }
    if (boards.length > 0) {
      return boards[0];
    }
    return null;
  }, [boards, boardSlug]);

 // 1. Fetch Board and Columns only when boardSlug changes
useEffect(() => {
  if (boardSlug) {
    // Wrap this in a single action if possible, or sequence them
    dispatch(fetchBoard()).then((res) => {
       // Logic to find current board from results
    });
  }
}, [boardSlug, dispatch]);
useEffect(() => {
  // If we are on HomeTab (no boardSlug), fetch tasks for ALL boards
  if (!boardSlug && boards.length > 0) {
    boards.forEach(b => {
      dispatch(fetchColumn(b._id)); // You need the columns to get the tasks
    });
  }
}, [boardSlug, boards, dispatch]);

// 2. Fetch columns only when the currentBoard ID is confirmed
useEffect(() => {
  if (currentBoard?._id) {
    dispatch(fetchColumn(currentBoard._id));
  }
}, [currentBoard?._id]);

// 3. Fetch Tasks ONLY when columns are first populated
// 3. Fetch Tasks ONLY when columns are first populated
useEffect(() => {
  const boardId = currentBoard?._id;
  // Use optional chaining and fallback to empty array
  const boardColumns = boardId ? (columns[boardId] || []) : [];
  
  if (boardId && boardColumns.length > 0) {
    boardColumns.forEach((col) => {
      dispatch(fetchTasksForColumn({ boardId, columnId: col._id }));
    });
  }
  // FIX: Access length safely using optional chaining
}, [currentBoard?._id, columns[currentBoard?._id || ""]?.length, dispatch]);

 // Inside BoardProvider.tsx
const getTaskByColumn = (columnId: string) => {
  return tasks.filter(t => {
    // 1. Check if task belongs to the column
    const tColId = typeof t.column === 'object' ? (t.column as any)._id : t.column;
    const isRightColumn = tColId?.toString() === columnId.toString();

    // 2. Check if task belongs to the CURRENT board
    const tBoardId = typeof t.board === 'object' ? (t.board as any)._id : t.board;
    const isRightBoard = tBoardId?.toString() === currentBoard?._id?.toString();

    return isRightColumn && isRightBoard;
  });
};
useEffect(() => {
  // When we switch boards, clear the old tasks from Redux 
  // so the new ones can load fresh.
  dispatch(clearTasks());
}, [boardSlug, dispatch]);

  const contextValue: BoardProviderProps = useMemo(() => ({
    board: currentBoard,
    loading: globalLoading,
    task:tasks,
    getTaskByColumn,
    addMember: (memberId: string) => currentBoard && dispatch(addMember({ boardId: currentBoard._id, memberId })),
    addColumn: (name: string) => currentBoard && dispatch(addColumn({ boardId: currentBoard._id, name })),
    deleteColumn: (columnId: string) => currentBoard && dispatch(deleteColumn({ boardId: currentBoard._id, columnId })),
    deleteTask: (taskId: string) => dispatch(deleteTask({ taskId })),
    updateTask: (taskId: string, updates: Partial<Task>) => dispatch(updateTask({ taskId, update: updates })),
    moveTask: (taskId: string, toColumnId: string, toPosition: number) => dispatch(moveTask({ taskId, newColumnId: toColumnId, newPosition: toPosition })),
    addComment: (taskId: string, text: string) => dispatch(addComment({ taskId, text })),
    updateProgress: (taskId: string, progress: number) => dispatch(updateProgress({ taskId, progress }))

  }), [currentBoard, tasks, columns, dispatch, globalLoading])

  return (
    <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>
  )
}
