import { useContext, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/app/hook'
import {  fetchColumn,  } from '../../../redux/features/Column/columnSlice';
import { DashBoardHeader } from './DashBoardHeader';
import { DashBoardBody } from './DashBoardBody';
import {  deleteTask, fetchTasksForColumn } from '../../../redux/features/Task/taskSlice';
import { BoardContext } from '../../../context/board/BoardContext';

export const ProjectDetails = () => {
    const boardDetails = useContext(BoardContext)
    const board=boardDetails?.board
    const dispatch = useAppDispatch()
    const boards = useAppSelector(state => state.board.boards)
    const column = useAppSelector(state => state.column.columns)
    const task = useAppSelector(state => state.task.task)
  useEffect(() => {
        if (board?._id) {
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
    
     const handaleDeleteTask=(taskId:string)=>{
        dispatch(deleteTask({taskId}))
    }
  
    return (
        <div>
            <div className='max-w-6xl mx-auto'>
                    <DashBoardHeader />
                    <DashBoardBody
                        onDeleteTask={handaleDeleteTask}
                        task={task}
                    />
            </div>
        </div>
    )
}
