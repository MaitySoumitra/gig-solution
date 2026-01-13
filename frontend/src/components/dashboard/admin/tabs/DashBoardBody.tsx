import { useContext, useState } from "react";
import type { Task } from "../../../types/allType";
import TaskView from "../../../redux/features/Task/taskView";
import { CalendarBlank, Flag, Plus, Tag, X } from "@phosphor-icons/react";
import { TaskDetails } from "./TaskDetails";

import { useAppSelector } from "../../../redux/app/hook";
import { BoardContext } from "../../../context/board/BoardContext";

export const DashBoardBody = () => {
  const [showColumnInput, setShowColumnInput] = useState(false)
  const [columnName, setColumnName] = useState("")
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [openMenuColumn, setOpenMenuColumn] = useState<string | null>(null)
  const columns = useAppSelector(state => state.column.columns)

  const boardDetails = useContext(BoardContext)
  if (!boardDetails) return null
  const { board, addColumn, deleteColumn, moveTask, task } = boardDetails

  if (!board) return null
  const column = columns[board._id] || []
  const taskStatus = (task: Task) => {
    return column.find(c => c._id === task.column)?.name || null
  }
  return (
    <div>
      <div className='flex gap-2 mt-2 '>
        <div className='flex gap-2  relative h-full'>
          {column.map((c: any) => (
            <div key={c._id}
              className="bg-gray-100 rounded-lg p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("application/json"));
                const tasksInThisColumn = task.filter(t => t.column.toString() === c._id);
                const bottomPosition = tasksInThisColumn.length;
                moveTask(data.taskId, c._id, bottomPosition);
              }}
            >
              <div className="flex gap-4 items-center justify-between font-bold text-xs ">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#0052CC] text-white px-2 py-1 rounded-[3px] uppercase tracking-wide text-[10px]">
                    <span className="mr-1.5 inline-block w-3 h-3 border-2 border-white rounded-full opacity-80"></span>
                    {c.name}
                  </div>
                  <span className="ml-1 text-gray-500 font-medium text-sm">
                    {task.filter(t => t.column === c._id).length}
                  </span>
                </div>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none"
                    onClick={() => setOpenMenuColumn(openMenuColumn === c._id ? null : c._id)}
                  >
                    ···
                  </button>
                  {openMenuColumn === c._id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-50">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          deleteColumn(c._id)
                          setOpenMenuColumn(null)
                        }}>
                        delete Column
                      </button>
                    </div>
                  )}
                </div>

              </div>
              {task
                .filter((t) => {
                  const taskColumnId = typeof t.column === 'object' ? t.column._id : t.column;
                  return taskColumnId?.toString() === c._id.toString();
                })
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map((t, index) => (


                  <div
                    key={t._id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                          taskId: t._id,
                          fromColumnId: c._id,
                          fromIndex: index,
                        })
                      );
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      const data = JSON.parse(e.dataTransfer.getData("application/json"));
                      let finalPosition = index;
                      if (data.fromColumnId === c._id && data.fromIndex < index) {
                        finalPosition = index - 1;
                      }
                      moveTask(data.taskId, c._id, finalPosition);
                    }}
                    className="p-3 shadow-lg  rounded-lg mt-2 cursor-pointer bg-white hover:border-blue-400 transition-colors"
                    onClick={() => setSelectedTask(t)}
                  >
                    <p className="text-gray-800 text-sm font-medium mb-3 leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {t.assignedTo?.[0]?.name && (
                        <div className="w-6 h-6 text-[10px] text-white flex shrink-0 justify-center items-center font-bold rounded-full bg-[#B18CFE]">
                          {t.assignedTo[0].name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <div className="flex items-center gap-1 px-2 py-0.5 border rounded-md text-[#2D7A7B] bg-gray-50/50 text-[11px] font-medium">
                          <CalendarBlank size={14} weight="bold" />
                          <span>
                            {new Date(t.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 border rounded-md text-gray-600 bg-gray-50/50 text-[11px] font-medium">
                          <Flag size={14} weight="fill" className="text-yellow-500" />
                          <span>{t.priority}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 border rounded-md text-gray-600 bg-gray-50/50 text-[11px] font-medium">
                          <Tag size={14} /> <span>{t.labels.map(l => l.name)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {selectedTask && (
                <div className="absolute w-40 h-60 shadow-lg bg-gray-50">
                  <TaskDetails
                    status={taskStatus(selectedTask)}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
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
                  <TaskView boardId={board._id} columnId={c._id} />
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
                onClick={() => addColumn(columnName)}
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
