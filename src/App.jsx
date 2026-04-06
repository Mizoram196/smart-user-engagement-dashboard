import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AnalyticsTracker from './components/AnalyticsTracker';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HeatmapView from './pages/HeatmapView';
import SessionReplayView from './pages/SessionReplayView';

const RootRedirect = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/user" replace />;
};

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
                    <AnalyticsTracker />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />

                        {/* Admin Routes */}
                        <Route element={<ProtectedRoute role="Admin" />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/heatmap" element={<HeatmapView />} />
                            <Route path="/admin/replays" element={<SessionReplayView />} />
                            <Route path="/admin/reports" element={<AdminDashboard />} /> {/* Mocked via dashboard for demo */}
                        </Route>

                        {/* User Routes */}
                        <Route element={<ProtectedRoute role="User" />}>
                            <Route path="/user" element={<UserDashboard />} />
                            <Route path="/user/activity" element={<UserDashboard />} /> {/* Mocked via dashboard for demo */}
                        </Route>

                        {/* Common Authenticated Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        <Route path="/" element={<RootRedirect />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
