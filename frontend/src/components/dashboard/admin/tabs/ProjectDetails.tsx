import { useContext, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/app/hook'
import { addMember } from '../../../redux/features/Board/boardSlice'
import type { Task } from '../../../types/allType';


import { addColumn, fetchColumn } from '../../../redux/features/Column/columnSlice';
import { DashBoardHeader } from './DashBoardHeader';
import { DashBoardBody } from './DashBoardBody';
import { addTask, fetchTasksForColumn } from '../../../redux/features/Task/taskSlice';
import { BoardContext } from '../../../context/board/BoardContext';

export const ProjectDetails = () => {

    const dispatch = useAppDispatch()

    const boards = useAppSelector(state => state.board.boards)

    const column = useAppSelector(state => state.column.columns)

    const task = useAppSelector(state => state.task.task)

    const board = useContext(BoardContext)
    if (!board) return null

    const handleAddMember = (boardId: string, memberId: string) => {
        dispatch(addMember({ boardId, memberId }))
    }
    const handaleAddColumn = (boardId: string, name: string) => {
        dispatch(addColumn({ boardId, name }))
    }
    const handaleAddTask = (boardId: string, columnId: string, taskData: Partial<Task>) => {
        dispatch(addTask({ boardId, columnId, taskData }))
    }

    useEffect(() => {
        if (board._id) {
            dispatch(fetchColumn(board._id))
        }
    }, [board, dispatch])
    useEffect(() => {
        if (board?._id) {
            const boardColumns = column[board._id] || [];
            boardColumns.forEach(col => {
                if (col._id) {
                    dispatch(fetchTasksForColumn({ boardId: board._id, columnId: col._id }))
                }
            })
        }
    }, [boards, column, dispatch]);

    return (
        <div>
            <div className='max-w-6xl mx-auto'>
                    <DashBoardHeader
                        onAddMember={handleAddMember}
                    />
                    <DashBoardBody
                        onAddColumn={handaleAddColumn}
                        onAddTask={handaleAddTask}
                        task={task}
                    />
            </div>
        </div>
    )
}
