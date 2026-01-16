
import { Sidebar } from './Sidebar'
import { Routes, Route, useParams, Navigate} from 'react-router-dom'
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

  // Prevent rendering if the role hasn't loaded yet
  if (!role) return <GlobalSpinner />; 

  return (
    <div className='flex min-h-screen max-w-8xl mx-auto px-4 py-5 font-sans-serif'>
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          {/* Explicitly define the root for the dashboard */}
          <Route path="/" element={role ? <HomeTab /> : <GlobalSpinner />} /> 
          
          <Route 
            path="my-tasks" 
            element={role === 'admin' || role === 'super-admin' ? <AllTask /> : <MyTask />} 
          />
          
          {/* The Wrapper should check if the slug is valid before providing context */}
          <Route path=":boardSlug" element={<BoardProviderWrapper />} />

          {/* If everything fails, go back to dashboard root */}
          <Route path="*" element={<Navigate to={`/${role}/dashboard`} replace />} />
        </Routes>
      </div>
    </div>
  );
};


// Helper component to handle the dynamic key
const BoardProviderWrapper = () => {
  const { boardSlug } = useParams();
  if (!boardSlug || boardSlug === "undefined") {
    return <HomeTab />;
  }
  return (
    // The 'key' forces React to destroy and recreate the provider on slug change
    <BoardProvider key={boardSlug}>
      <GlobalSpinner/>
      <ProjectDetails />
     
    </BoardProvider>
  );
};