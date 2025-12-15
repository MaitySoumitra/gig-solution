import { useState } from "react";
import type { Task } from "../../../types/allType";
import TaskView from "../../../redux/features/Task/taskView";

interface Column{
    _id:string,
    name:string,
    task?:string[]
}
interface DashBoardBodyProps{
    id:string,
    column:Column[],
    onAddColumn: (boardId:string, name:string)=>void,
    onAddTask:(boardId:string, columnId:string, taskData:Partial<Task>)=>void
}

export const DasBoardBody = ({column, id, onAddColumn, onAddTask}:DashBoardBodyProps) => {
     const [showColumnInput, setShowColumnInput] = useState(false)
      const [columnName, setColumnName] = useState("")
      const [showTaskInput, setShowTaskInput]=useState(false)
      const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

    return (
        <div>
            <div className='flex gap-2 mt-2'>
                <div className='flex gap-2 h-100 '>
                    {column.map((c: any) => (
  <div key={c._id}>
    <div className='text-center font-bold px-2 py-2 border-b bg-gray-100 w-40'>{c.name}</div>

    {c.task && c.task.map((t: string, idx: number) => (
      <div key={idx}>{t}</div>
    ))}

    <button 
      onClick={() => setActiveColumnId(c._id)}
      className="px-2 py-1 bg-blue-500 text-white rounded mt-1"
    >
      ➕ Add Task
    </button>

    {activeColumnId === c._id && (
      <div className="mt-2">
        <TaskView boardId={id} columnId={c._id} />
        <button 
          onClick={() => setActiveColumnId(null)} 
          className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    )}
  </div>
))}

                </div>
                <div>
                    {!showColumnInput ? (
                        <button
                            onClick={() => {
                                setShowColumnInput(true);

                            }}
                            className='px-3 py-2 bg-gray-50 text-white rounded shadow'
                        >
                            ➕
                        </button>
                    ) : (
                        <div className="flex space-x-2 items-center">
                            <input
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                placeholder="Column name"
                                className="px-2 py-1 border rounded"
                            />
                            <button
                                onClick={()=>onAddColumn(id, columnName)}
                                className="px-3 py-1 bg-green-500 text-white rounded"
                            >
                                Save
                            </button>
                            <button onClick={() => setShowColumnInput(false)}>❌</button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
