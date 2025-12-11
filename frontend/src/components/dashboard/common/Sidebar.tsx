// src/components/Sidebar.tsx (Revised for Scalability)

import React from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../redux/features/User/login/loginSlice';
import { useAppDispatch, useAppSelector } from '../../redux/app/hook';
import { House, Users, PlusSquare, type IconProps } from "@phosphor-icons/react";
import axiosClient from '../../api/axiosClient';

// Define the shape for a navigation item
interface NavLinkItem {
    to: string;
    label: string;
    icon: React.FC<IconProps>;
    group?: string; // e.g., "ADMIN ACTIONS"
    roles: string[]; // List of roles allowed to see this link
}

// Define all navigation links and their role requirements
const NAV_LINKS: NavLinkItem[] = [
    { to: "/dashboard", label: "My Boards", icon: House, roles: ['admin', 'super-admin', 'Developer', 'member'] },
    { to: "/admin/boards/new", label: "Create Project", icon: PlusSquare, group: "ADMIN ACTIONS", roles: ['admin', 'super-admin', 'Developer'] },
    { to: "/admin/users", label: "User Management", icon: Users, group: "ADMIN ACTIONS", roles: ['super-admin', 'Developer'] },
    // Add more links here for other roles/pages
];

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user); 
    const role = user?.role;
    
    // Filter links based on the current user's role
    const filteredLinks = NAV_LINKS.filter(link => 
        role && link.roles.includes(role.toLowerCase()) // Match the role (ensure consistent case)
    );

    const handleLogout = async() => {
        try{
            await axiosClient.post('/api/users/logout', {withCredentials: true})
        return true    
        }
        catch(err){
            console.error("something went wrong", err)
        } 
    };

    // Group links for display (e.g., separating Admin actions)
    const groupedLinks = filteredLinks.reduce((acc, link) => {
        const groupKey = link.group || 'MAIN';
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(link);
        return acc;
    }, {} as Record<string, NavLinkItem[]>);


    const renderLink = (link: NavLinkItem) => (
        <Link 
            key={link.to} 
            to={link.to} 
            className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
            <link.icon size={20} className="mr-3" /> {link.label}
        </Link>
    );

    return (
        <div className="w-64 flex flex-col p-4 bg-gray-800 text-white min-h-screen shadow-xl"> 
            
            {/* Header / Logo */}
            <h1 className="text-2xl font-extrabold mb-8 border-b border-gray-700 pb-3 text-[#feb238]">
                {role?.toUpperCase() || 'GUEST'} Portal
            </h1>
            
            
            <nav className="flex-grow space-y-4">
                {/* 1. Main Links */}
                {groupedLinks['MAIN'] && groupedLinks['MAIN'].map(renderLink)}

                {/* 2. Grouped Links (e.g., Admin Actions) */}
                {groupedLinks['ADMIN ACTIONS'] && (
                    <div className="pt-4 border-t border-gray-700 mt-4 space-y-2">
                        <p className="text-sm font-semibold mb-2 text-gray-400 px-4">ADMIN ACTIONS</p>
                        {groupedLinks['ADMIN ACTIONS'].map(renderLink)}
                    </div>
                )}
            </nav>

            {/* Footer / Logout Section */}
            <div className="mt-auto pt-4 border-t border-gray-700">
                <div className="text-sm mb-2 text-gray-400">
                    Logged in as: <span className="font-semibold text-white">{user?.name}</span>
                </div>
                <button 
                    onClick={async()=>{
                        const success=await handleLogout()
                        if(success){
                            window.location.href='/'
                        }
                    }} 
                    className="w-full py-2 bg-[#feb238] hover:bg-[#d69830] text-white rounded transition duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;