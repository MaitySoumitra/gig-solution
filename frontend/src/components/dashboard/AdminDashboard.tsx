 
import { Sidebar } from './Sidebar'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HomeTab } from './tabs/HomeTab'
import { GlobalSpinner } from '../context/GlobalSpinner'
 
import { useAppSelector } from '../redux/app/hook'
import { Topbar } from './TopBar'
import { TasksPageWrapper } from './TaskPagewrapper'
import { BoardQueryWrapper } from '../context/BoardQueryWrapper'
import { useState } from 'react'
import Teams from './Teams'
import ChatsPage from '../ChatsPage/ChatsPage'
 
export const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
 
  const user = useAppSelector(state => state.login.user);
  const role = user?.role;
 
  const location = useLocation();
  const isChatPage = location.pathname.endsWith("/chats");
  if (!role) return <GlobalSpinner />;
 
  return (
    <div className='min-h-screen'>
 
      {!isChatPage && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}
 
      <div className={`transition-all duration-300 ${!isChatPage
        ? collapsed
          ? "ml-16"
          : "ml-64"
        : ""
        }`}>
 
        {!isChatPage && <Topbar />}
        <Routes>
          <Route index element={role ? <HomeTab /> : <GlobalSpinner />} />
          <Route path=":boardSlug" element={<BoardQueryWrapper />} />
          <Route path="tasks" element={<TasksPageWrapper />} />
          <Route path="teams" element={<Teams />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="*" element={<Navigate to={`/`} replace />} />
        </Routes>
      </div>
    </div>
  );
};
 
 