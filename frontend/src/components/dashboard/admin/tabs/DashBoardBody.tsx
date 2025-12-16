import { useState } from "react";
import type { Task } from "../../../types/allType";
import TaskView from "../../../redux/features/Task/taskView";
import { X } from "@phosphor-icons/react";
import { TaskDetails } from "./TaskDetails";

interface Column {
  _id: string,
  name: string,
  task?: string[]
}
interface DashBoardBodyProps {
  id: string,
  column: Column[],
  onAddColumn: (boardId: string, name: string) => void,
  onAddTask: (boardId: string, columnId: string, taskData: Partial<Task>) => void
  task: Task[]
}

export const DashBoardBody = ({ column, id, onAddColumn, onAddTask, task }: DashBoardBodyProps) => {
  const [showColumnInput, setShowColumnInput] = useState(false)
  const [columnName, setColumnName] = useState("")
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask]=useState<Task | null>(null)

  return (
    <div>
      <div className='flex gap-2 mt-2'>
        <div className='flex gap-2 h-100 '>
          {column.map((c: any) => (
            <div key={c._id}>
              <div className='relative text-center font-bold px-2 py-2 border-b bg-gray-100 w-40'>{c.name}</div>

              {
                task.filter(t => t.column.toString() === c._id)
                  .map(t => (
                    <div 
                    key={t._id} 
                    className="p-2 shadow-lg rounded-sm rounded mt-1 cursor-pointer"
                    onClick={()=>setSelectedTask(t)}
                    
                    >
                      <p>{t.title}</p>
                      <p>📅{new Date(t.dueDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</p>
                      <p>🚩{t.priority}</p>
                    </div>
                  ))
              }
              {selectedTask &&(
                <div className="absolute w-40 h-60 shadow-lg bg-gray-50">
                  <TaskDetails 
                  task={selectedTask} 
                  onClose={()=>setSelectedTask(null)} 
                  onSave={(upDatedTask)=>{
                    console.log("Task Updated:", upDatedTask)
                  }}
                  />
                   </div>
              )}

              <button
                onClick={() => setActiveColumnId(c._id)}
                className=""
              >
                ➕ create
              </button>

              {activeColumnId === c._id && (
                <div className="mt-2 absolute shadow-lg rounded-lg">
                  <TaskView boardId={id} columnId={c._id} />

                  <button
                    onClick={() => setActiveColumnId(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full items-center flex justify-center font-bold"
                  >
                    <X />
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
                onClick={() => onAddColumn(id, columnName)}
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
