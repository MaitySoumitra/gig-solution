import { useContext } from 'react'
import {
    X,  ListChecks, UsersIcon,  Folder, Plus, ArrowSquareOut, Star, CornersOut, DotsThree, Sparkle
} from "@phosphor-icons/react"
import { BoardContext } from '../../../context/board/BoardContext'

export const TaskDetailsHeader = ({onClose}:{onClose:()=>void}) => {
    const board =useContext(BoardContext)
    if(!board) return null
  return (
    <div>
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
                    {/* Left Side: Breadcrumbs and Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Folder size={18} />
                            <span className="hover:underline cursor-pointer">Project Board</span>
                            <span className="text-gray-300">/</span>
                            <ListChecks size={18} weight="bold" className="text-gray-500" />
                            <span className=" text-gray-500  tracking-tight">{board.name}</span>
                        </div>

                        <div className="flex items-center gap-1 ml-2 border-l pl-3 border-gray-200">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <Plus size={20} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <ArrowSquareOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Meta Info and Global Actions */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Created Apr 21
                        </div>

                        <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 text-sm font-medium">
                                <Sparkle size={18} className="text-purple-500" weight="fill" />
                                Ask AI
                            </button>

                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 text-sm font-medium">
                                <UsersIcon size={18} />
                                Share
                            </button>

                            <div className="flex items-center gap-0.5 ml-2 border-l pl-2 border-gray-200">
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                                    <DotsThree size={20} weight="bold" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                                    <Star size={20} />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                                    <ArrowSquareOut size={20} />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                                    <CornersOut size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    </div>
  )
}
