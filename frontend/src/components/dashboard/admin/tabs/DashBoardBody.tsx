import { useState } from "react";
import type { Task } from "../../../types/allType";
import TaskView from "../../../redux/features/Task/taskView";
import { Plus, X } from "@phosphor-icons/react";
import { TaskDetails } from "./TaskDetails";
import { moveTask } from "../../../redux/features/Task/taskSlice";
import { useAppDispatch } from "../../../redux/app/hook";

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const dispatch = useAppDispatch()
  const taskStatus = (task: Task) => {
    return column.find(c => c._id === task.column)?.name
  }
  const handleTaskMove = (taskId: string, toColumnId: string, toPosition: number) => {
    dispatch(moveTask({
      taskId,
      newColumnId: toColumnId,
      newPosition: toPosition
    }));
  };


  return (
    <div>
      <div className='flex gap-2 mt-2'>
        <div className='flex gap-2 relative h-full '>
          {column.map((c: any) => (
            <div key={c._id}
              className="bg-gray-100 rounded-lg p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("application/json"));

                // 1. Find all tasks belonging to THIS column (c._id)
                const tasksInThisColumn = task.filter(t => t.column.toString() === c._id);

                // 2. The "Bottom" position is the total count of tasks currently there
                const bottomPosition = tasksInThisColumn.length;

                handleTaskMove(data.taskId, c._id, bottomPosition);
              }}

            >
              <div className=' font-bold px-2 py-2 border-b border-gray-300  w-[250px]'>{c.name}</div>

              {
                task.filter(t => t.column.toString() === c._id)
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map((t, index) => (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({
                          taskId: t._id,
                          fromColumnId: c._id,
                          fromIndex: index // ADD THIS
                        }));
                      }}
                      // Handle dropping directly on another task (reordering)
                     onDrop={(e) => {
  e.stopPropagation();
  const data = JSON.parse(e.dataTransfer.getData("application/json"));

  let finalPosition = index;

  // FIX: Adjust index when dragging DOWN within same column
  if (data.fromColumnId === c._id && data.fromIndex < index) {
    finalPosition = index - 1;
  }

  handleTaskMove(data.taskId, c._id, finalPosition);
}}

                      className="p-2 shadow-sm border rounded mt-2 cursor-pointer bg-white"
                      onClick={() => setSelectedTask(t)}
                    >
                      <p>{t.title}</p>
                      <p>📅{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p>🚩{t.priority}</p>
                    </div>
                  ))
              }
              {selectedTask && (
                <div className="absolute w-40 h-60 shadow-lg bg-gray-50">
                  <TaskDetails
                    status={taskStatus(selectedTask)}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={(upDatedTask) => {
                      console.log("Task Updated:", upDatedTask)
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => setActiveColumnId(c._id)}
                className="apperance-none flex justify-center gap-2 items-center mt-2"
              >
                <Plus /> create task
              </button>

              {activeColumnId === c._id && (
                <div className="relative mt-2 shadow-lg rounded-lg">
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
              className='apperance-none px-3 py-2 bg-gray-50 text-gray-600 rounded shadow'
            >
              <Plus />
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

    </div >
  )
}
