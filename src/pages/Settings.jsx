import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Bell, Monitor, Globe, Shield, CreditCard, Save, Check, RefreshCw, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        weekly: false,
        security: true
    });
    const [language, setLanguage] = useState('English');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Settings saved successfully!', { icon: '⚙️' });
        }, 1200);
    };

    const toggleNotif = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure your dashboard experience and account defaults</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                
                {/* Appearance Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Monitor size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Appearance</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 500 }}>Global Theme</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Switch between light and dark mode</p>
                            </div>
                            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
                                {theme === 'light' ? 'Set Dark' : 'Set Light'}
                                <RefreshCw size={14} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 500 }}>High Contrast</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enhanced visibility for charts</p>
                            </div>
                            <div className={`badge ${theme === 'dark' ? 'badge-admin' : 'badge-user'}`}>Beta</div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Bell size={20} color="var(--success)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>{key} Notifications</p>
                                <div 
                                    onClick={() => toggleNotif(key)}
                                    style={{ 
                                        width: '40px', height: '22px', borderRadius: '11px', 
                                        backgroundColor: value ? 'var(--success)' : 'var(--border-color)',
                                        position: 'relative', cursor: 'pointer', transition: '0.3s'
                                    }}
                                >
                                    <div style={{ 
                                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                                        position: 'absolute', top: '2px', left: value ? '20px' : '2px', transition: '0.3s'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Globe size={20} color="var(--info)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Language & Region</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Display Language</label>
                            <select 
                                className="input-field" 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ width: '100%', backgroundColor: 'var(--bg-primary)' }}
                            >
                                <option>English</option>
                                <option>Tamil</option>
                                <option>Spanish</option>
                                <option>Hindi</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 500 }}>Timezone</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard Indian Time (IST)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section (Placeholder for Demo) */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Shield size={20} color="var(--danger)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Privacy & Security</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>Two-Factor Auth</p>
                            <span className="badge badge-user">Disabled</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>Data Anonymization</p>
                            <span className="badge badge-admin">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>Discard Changes</button>
                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.75rem 2rem', gap: '0.5rem' }} disabled={loading}>
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save All Settings
                </button>
            </div>
        </div>
    );
};

export default Settings;
