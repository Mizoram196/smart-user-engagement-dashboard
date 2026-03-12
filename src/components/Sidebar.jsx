import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Activity, FileText, User as UserIcon, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: user?.role === 'Admin' ? '/admin' : '/user', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        ...(user?.role === 'Admin' ? [
            { path: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
            { path: '/admin/reports', icon: <FileText size={20} />, label: 'Reports' },
        ] : [
            { path: '/user/activity', icon: <Activity size={20} />, label: 'My Activity' },
        ]),
        { path: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Activity color="var(--accent-color)" size={28} />
                SmartDash
            </div>
            <div className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </div>
            <div style={{ padding: '1rem' }}>
                <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)' }}>
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
