import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';
import { register } from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const res = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            setSuccess(res.message);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel" style={{ maxWidth: '450px' }}>
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <Activity size={48} />
                </div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join us to start tracking your engagement</p>

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

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="name"
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ paddingLeft: '2.5rem' }}
                                required
                            />
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
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

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? 'Creating account...' : (
                            <>
                                <UserPlus size={20} />
                                Sign Up
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
