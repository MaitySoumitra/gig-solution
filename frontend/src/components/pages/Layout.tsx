// src/components/Layout.tsx (Recommended Revision)

import React from 'react';
import Sidebar from '../dashboard/common/Sidebar';
import { useAppSelector } from '../redux/app/hook'; // Ensure correct path
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen font-sans-serif">
            
            <main className="flex-grow p-6  text-gray-800">
                {children}
            </main>
        </div>
    );
};


export default Layout;