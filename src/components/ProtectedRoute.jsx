import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const ProtectedRoute = ({ role }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to={user.role === 'Admin' ? '/admin' : '/user'} replace />;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <Topbar />
                <Outlet />
            </main>
        </div>
    );
};
