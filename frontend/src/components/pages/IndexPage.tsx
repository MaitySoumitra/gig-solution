// src/components/IndexPage.tsx (No changes needed, the logic is correct IF the hook works)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/app/hook';
// This is the source of the fix
import ProtectedRoute from '../routes/ProtectedRoute';
import AdminDashboard from '../dashboard/super-admin/AdminDashboard';
import Auth from '../redux/features/User/Auth'
export const IndexPage = () => {
    // isFetched tells us Redux has been updated
    const { user } = useAppSelector(state => state.login);
    
    // --- BLOCK RENDERING UNTIL Redux IS UPDATED ---
   
    // --- Render Routes AFTER Auth State is Final ---
    return (
        <Routes>
            {/* 1. PUBLIC ROUTE */}
            <Route 
                path='/' 
                element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
            />
            
            {/* 2. PROTECTED DASHBOARD ROUTE */}
            <Route 
                path="/dashboard" 
                element={<ProtectedRoute>
                    <AdminDashboard />
                    </ProtectedRoute>}
            />
            
            {/* 3. FALLBACK */}
            <Route path="*" element={
                <div className="flex items-center justify-center min-h-screen text-red-700">404: Page Not Found</div>
            } />
        </Routes>
    );
};