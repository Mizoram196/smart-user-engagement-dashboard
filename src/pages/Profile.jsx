import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Lock, Save, Edit2, X } from 'lucide-react';
import { updateProfile } from '../services/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const data = { name: formData.name };
            if (formData.password) data.password = formData.password;

            const updatedUser = await updateProfile(user._id || user.id, data);

            // Assuming useAuth provides a way to update the user state locally
            if (typeof setUser === 'function') {
                setUser(updatedUser);
            }

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <h1 className="page-title">Profile Setting</h1>
                <p className="page-subtitle">Manage your personal profile information</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--accent-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '2.5rem',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        {user?.name.charAt(0)}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{user.role} Account</p>
                    <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}>
                        <Shield size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {user.role} Privileges
                    </span>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                            Personal Information
                        </h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        ) : (
                            <button onClick={() => { setIsEditing(false); setError(''); setSuccess(''); }} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                <X size={16} /> Cancel
                            </button>
                        )}
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {success}
                        </div>
                    )}

                    {!isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <User size={16} /> Full Name
                                </label>
                                <div className="input-field" style={{ backgroundColor: 'var(--bg-primary)' }}>{user.name}</div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <Mail size={16} /> Email Address
                                </label>
                                <div className="input-field" style={{ backgroundColor: 'var(--bg-primary)' }}>{user.email}</div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <Calendar size={16} /> Member Since
                                </label>
                                <div className="input-field" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                    {new Date(user.createdAt || user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <Lock size={16} /> New Password <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(Leave blank to keep current)</span>
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    minLength={6}
                                />
                            </div>

                            {formData.password && (
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        <Lock size={16} /> Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                                    <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
