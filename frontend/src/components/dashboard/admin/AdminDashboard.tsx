
import { Sidebar } from './Sidebar'
import { Routes, Route, useParams} from 'react-router-dom'
import {HomeTab} from './tabs/HomeTab'

import { ProjectDetails } from './tabs/ProjectDetails'
import { BoardProvider } from '../../context/board/BoardProvider'
import { GlobalSpinner } from '../../context/board/GlobalSpinner'
import { MyTask } from './tabs/MyTask'
import { AllTask } from './tabs/AllTask'
import { useAppSelector } from '../../redux/app/hook'


export const AdminDashboard = () => {
  const user = useAppSelector(state => state.login.user);
  const role = user?.role;
  return (
    <div className='flex min-h-screen max-w-8xl mx-auto px-4 py-5 font-sans-serif'>
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route index element={<HomeTab />} />
          <Route path='my-tasks' element={role==='admin' || role==='super-admin' ?<AllTask/> : <MyTask/>}/>
          
          {/* Wrap ONLY the project details and use the slug as a key */}
          <Route 
            path=":boardSlug" 
            element={
              <BoardProviderWrapper />
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

// Helper component to handle the dynamic key
const BoardProviderWrapper = () => {
  const { boardSlug } = useParams();
  return (
    // The 'key' forces React to destroy and recreate the provider on slug change
    <BoardProvider key={boardSlug}>
      <GlobalSpinner/>
      <ProjectDetails />
     
    </BoardProvider>
  );
};