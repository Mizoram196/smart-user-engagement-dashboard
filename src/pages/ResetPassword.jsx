import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Save, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!token) {
            return setError('Token is missing');
        }

        setLoading(true);

        try {
            const res = await resetPassword(token, formData.password);
            setSuccess(res.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        Invalid or missing reset token.
                    </div>
                    <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                        Go back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
                    <Lock size={48} />
                </div>
                <h1 className="auth-title">Set New Password</h1>
                <p className="auth-subtitle">Create a secure password for your account.</p>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {success} Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div>
                        <label htmlFor="password">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                                minLength={6}
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? 'Updating password...' : (
                            <>
                                <Save size={20} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
