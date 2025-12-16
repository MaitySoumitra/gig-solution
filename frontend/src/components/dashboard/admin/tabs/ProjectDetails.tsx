import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/app/hook'
import { addMember, fetchBoard } from '../../../redux/features/Board/boardSlice'
import type { Task } from '../../../types/allType';


import { addColumn, fetchColumn } from '../../../redux/features/Column/columnSlice';
import { DashBoardHeader } from './DashBoardHeader';
import { DashBoardBody } from './DashBoardBody';
import { addTask, fetchTasksForColumn } from '../../../redux/features/Task/taskSlice';

export const ProjectDetails = () => {

    const dispatch = useAppDispatch()
    const boards = useAppSelector(state => state.board.boards)

    const column = useAppSelector(state => state.column.columns)

    const task=useAppSelector(state=>state.task.task)

    const handleAddMember = (boardId: string, memberId: string) => {
        dispatch(addMember({ boardId, memberId }))
    }
    const handaleAddColumn = (boardId: string, name: string) => {
        dispatch(addColumn({ boardId, name }))
    }
    const handaleAddTask=(boardId:string, columnId:string, taskData:Partial<Task>)=>{
        dispatch(addTask({boardId, columnId, taskData}))
    }
    

    useEffect(() => {
        dispatch(fetchBoard())
    }, [dispatch])

    useEffect(() => {
        if (boards?.length) {
            boards.forEach(board => {
                if (board._id) {
                    dispatch(fetchColumn(board._id))
                }
            })
        }
    }, [boards, dispatch])
  useEffect(() => {
  boards.forEach(board => {
    const boardColumns = column[board._id] || [];
    boardColumns.forEach(col => {
      // Only dispatch if both IDs exist
      if (board._id && col._id) {
        dispatch(fetchTasksForColumn({ boardId: board._id, columnId: col._id }));
      }
    });
  });
}, [boards, column, dispatch]);

    return (
        <div>
            {
                boards?.map((b) => {
                    return (
                        <div key={b._id} className='max-w-6xl mx-auto'>

                            <DashBoardHeader
                                id={b._id}
                                members={b.members}
                                name={b.name}
                                onAddMember={handleAddMember}
                            />
                            <DashBoardBody 
                            column={column[b._id] || []} id={b._id} 
                            onAddColumn={handaleAddColumn} 
                            onAddTask={handaleAddTask}
                            task={task}
                            />

                        </div>
                    )
                })
            }
        </div>
    )
}
