
import { Sidebar } from './Sidebar'
import { Routes, Route, useParams } from 'react-router-dom'
import {HomeTab} from './tabs/HomeTab'
import { BoardTab } from './tabs/BoardTab'
import { MyBoardTab } from './tabs/MyBoardTab'
import { useAppDispatch, useAppSelector } from '../../redux/app/hook'
import { ProjectDetails } from './tabs/ProjectDetails'
import { slugify } from '../../hooks/slugify'

export const AdminDashboard = () => {
    const dispatch=useAppDispatch()
    const user= useAppSelector(state=>state.login.user)
    const role=user?.role
      const board=useAppSelector(state=>state.board.boards)
    const boardName=board?.map(b=>slugify(b.name))
    const { boardSlug } = useParams();
  return (
    <div className='flex min-h-screen max-w-8xl mx-auto px-4 py-5'>
        <Sidebar/>
        <div className="flex-1 p-6">
        <Routes>
          <Route index element={<HomeTab/>}/>
            
           <Route path=":boardSlug" element={<ProjectDetails />} /> 
            

        </Routes>
        </div>

    </div>
  )
}
