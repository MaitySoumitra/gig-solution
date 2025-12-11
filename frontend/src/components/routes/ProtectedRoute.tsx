// src/components/router/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/app/hook';
import Layout from '../pages/Layout'; // Adjust path to your Layout component

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * HOC (Higher-Order Component) for route protection.
 * 1. Checks if the user is authenticated (from Redux state).
 * 2. If authenticated, renders the children wrapped in the shared <Layout>.
 * 3. If NOT authenticated, redirects the user to the login page ("/").
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Read the authentication status from the Redux store
    const { isAuthenticated } = useAppSelector(state => state.login);
    
    if (!isAuthenticated) {
        // Redirect to the login page (root path "/")
        return <Navigate to="/" replace />; 
    }
    
    // Render the authenticated content, wrapped in the shared Layout
    return <Layout>{children}</Layout>; 
};

export default ProtectedRoute;