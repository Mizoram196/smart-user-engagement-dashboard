import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import toast from 'react-hot-toast';

const Topbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className="topbar">
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    Welcome back, {user?.name.split(' ')[0]}
                </h2>
            </div>
            <div className="topbar-actions">
                <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="icon-btn" style={{ position: 'relative' }} onClick={() => toast("You're all caught up!", { icon: '🙌' })}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px',
                        backgroundColor: 'var(--danger)', borderRadius: '50%'
                    }}></span>
                </button>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
                }}>
                    {user?.name.charAt(0)}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
