import { type ReactNode, useEffect, useMemo } from "react";
// Import the shared Context and the Interface
import { BoardContext, type BoardProviderProps } from "./BoardContext"; 
import { useAppDispatch, useAppSelector } from "../redux/app/hook";
import { useParams} from "react-router-dom";
import { slugify } from "../hooks/slugify";
import { addMember, fetchBoard } from "../redux/features/Board/boardSlice";
import type {  Task } from "../types/allType";
import { addColumn, deleteColumn, fetchColumn } from "../redux/features/Column/columnSlice";
import { 
  addComment, 
  getTasks, 

  deleteTask, 
  moveTask, 
  updateTask 
} from "../redux/features/Task/taskSlice";

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  const boards = useAppSelector((state) => state.board.boards);
  const tasks = useAppSelector((state) => state.task.task);
  const columns = useAppSelector((state) => state.column.columns);


  const isBoardIsLoading = useAppSelector((state) => state.board.loading === "pending");
  const isTaskIsLoading = useAppSelector((state) => state.task.loading === "pending");
  const globalLoading = isBoardIsLoading || isTaskIsLoading;

  const { boardSlug } = useParams<{ boardSlug: string }>();

  const currentBoard = useMemo(() => {
    if (boardSlug) {
      return boards.find((board) => slugify(board.name) === boardSlug) || null;
    }
    return null;
  }, [boards, boardSlug]);

  // Fetch columns and tasks when board selection changes
  useEffect(() => {
    if (currentBoard?._id) {
      dispatch(getTasks({ boardId: currentBoard._id }));
      dispatch(fetchColumn(currentBoard._id));
    }
  }, [currentBoard?._id, dispatch]);

  useEffect(() => {
    if (boardSlug) {
      dispatch(fetchBoard());
    }
  }, [boardSlug, dispatch]);

  useEffect(() => {
    if (!boardSlug && boards.length > 0) {
      boards.forEach((b) => {
        dispatch(fetchColumn(b._id));
      });
    }
  }, [boardSlug, boards, dispatch]);

  useEffect(() => {
    if (currentBoard?._id) {
      dispatch(getTasks({ boardId: currentBoard._id }));
    } else {
      dispatch(getTasks());
    }
  }, [currentBoard?._id, dispatch]);

  const getTaskByColumn = (columnId: string) => {
    return tasks.filter((t) => {
      const tColId = typeof t.column === "object" ? (t.column as any)._id : t.column;
      const isRightColumn = tColId?.toString() === columnId.toString();
      const tBoardId = typeof t.board === "object" ? (t.board as any)._id : t.board;
      const isRightBoard = tBoardId?.toString() === currentBoard?._id?.toString();

      return isRightColumn && isRightBoard;
    });
  };


  const contextValue: BoardProviderProps = useMemo(
    () => ({
      board: currentBoard,
      loading: globalLoading,
      task: tasks,
      getTaskByColumn,
      addMember: (memberId: string) =>
        currentBoard && dispatch(addMember({ boardId: currentBoard._id, memberId })),
      addColumn: (name: string) =>
        currentBoard && dispatch(addColumn({ boardId: currentBoard._id, name })),
      deleteColumn: (columnId: string) =>
        currentBoard && dispatch(deleteColumn({ boardId: currentBoard._id, columnId })),
      deleteTask: (taskId: string) => dispatch(deleteTask({ taskId })),
      updateTask: (taskId: string, updates: Partial<Task>) =>
        dispatch(updateTask({ taskId, update: updates })),
      moveTask: (taskId: string, toColumnId: string, toPosition: number) =>
        dispatch(
          moveTask({ taskId, newColumnId: toColumnId, newPosition: toPosition })
        ),
      // Fix: Ensure this returns the promise from the dispatch
      addComment: async (taskId: string, formData: FormData) => {
        return await dispatch(addComment({ taskId, formData }));
      },
    }),
    [currentBoard, tasks, columns, dispatch, globalLoading]
  );

  return (
    <BoardContext.Provider value={contextValue}>{children}</BoardContext.Provider>
  );
};