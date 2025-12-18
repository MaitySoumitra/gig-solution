// src/components/IndexPage.tsx (No changes needed, the logic is correct IF the hook works)


import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/app/hook';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AdminDashboard } from '../dashboard/admin/AdminDashboard';
import Auth from '../redux/features/User/Auth'
export const IndexPage = () => {

    const { user } = useAppSelector(state => state.login);
    return (
        <>
            <Routes>
                <Route path='/' element={<Auth />} />
                <Route path="/:role/dashboard/*" element={<AdminDashboard />} />
            </Routes>
           
        </>
    );
};