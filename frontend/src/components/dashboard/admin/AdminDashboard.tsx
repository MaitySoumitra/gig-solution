
import { Sidebar } from './Sidebar'
import { Routes, Route} from 'react-router-dom'
import {HomeTab} from './tabs/HomeTab'

import { ProjectDetails } from './tabs/ProjectDetails'
import { BoardProvider } from '../../context/board/BoardProvider'


export const AdminDashboard = () => {
   
   
  return (
    <div className='flex min-h-screen max-w-8xl mx-auto px-4 py-5 font-sans-serif'>
        <Sidebar/>
        <div className="flex-1 p-6">
        <Routes>
          <Route index element={<HomeTab/>}/>
            
           <Route path=":boardSlug" element={
            <BoardProvider>
              <ProjectDetails />
            </BoardProvider>
            } /> 
            

        </Routes>
        </div>

    </div>
  )
}
