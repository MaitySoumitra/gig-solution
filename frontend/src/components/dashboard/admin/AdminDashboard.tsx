
import { Sidebar } from './Sidebar'
import { Routes, Route} from 'react-router-dom'
import {HomeTab} from './tabs/HomeTab'

import { ProjectDetails } from './tabs/ProjectDetails'
import { BoardProvider } from '../../context/board/BoardProvider'
import { GlobalSpinner } from '../../context/board/GlobalSpinner'

export const AdminDashboard = () => {
  return (
    <BoardProvider> {/* Wrap everything ONCE here */}
      <GlobalSpinner />
      <div className='flex min-h-screen max-w-8xl mx-auto px-4 py-5 font-sans-serif'>
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route index element={<HomeTab />} />
            <Route path=":boardSlug" element={<ProjectDetails />} />
          </Routes>
        </div>
      </div>
    </BoardProvider>
  );
};