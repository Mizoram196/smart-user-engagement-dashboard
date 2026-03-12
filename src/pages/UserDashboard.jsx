import React, { useEffect, useState, useRef } from 'react';
import { getAnalytics, getActivities, getUserStats, getUserTimeline, getLeaderboard, getUserNotifications, getInsights, updateGoals, markNotificationsAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, Star, Clock, Map, Target, Flame, Medal, Award, Bell, Book, Users, BrainCircuit, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end)) {
            setCount(value);
            return;
        }
        if (start === end) return;

        let totalMilSecDur = duration;
        let incrementTime = (totalMilSecDur / end) * 2;
        if (incrementTime < 10) incrementTime = 10;

        const timer = setInterval(() => {
            start += Math.ceil(end / 20);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
}

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => (
    <div
        className={`skeleton-loading ${className}`}
        style={{ width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }}
    />
);

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [insights, setInsights] = useState([]);
    const [activeUsers, setActiveUsers] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showNotifs, setShowNotifs] = useState(false);
    const [filter, setFilter] = useState('Today'); // Today, Week, Month
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [editingGoals, setEditingGoals] = useState({ targetPages: 10, targetTime: 1800, targetActivity: 50 });

    useEffect(() => {
        // Socket connection
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');
        socket.on('activeUsersCount', (count) => {
            if (count > activeUsers && activeUsers !== 1) {
                toast(`Another user just came online! (${count} total)`, { icon: '👋' });
            }
            setActiveUsers(count);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                getAnalytics(user.id),
                getUserStats(user._id || user.id), // support id mapping differences 
                getUserTimeline(user._id || user.id),
                getLeaderboard(),
                getUserNotifications(user._id || user.id),
                getInsights()
            ]).then(([analyticsData, statsData, timeData, boardData, notifData, insightData]) => {
                setStats(analyticsData);
                setUserStats(statsData);
                setTimeline(timeData);
                setLeaderboard(boardData);
                setNotifications(notifData);

                // Only show a couple personalized insights to user
                const userInsights = insightData.filter(i => i.type === 'insight' || i.type === 'info').slice(0, 2);
                if (userInsights.length === 0) {
                    userInsights.push({ id: 99, type: 'insight', text: 'Users who explore the analytics section tend to improve their engagement score.' });
                }
                setInsights(userInsights);
                setLoading(false);

                // Greeting toast
                if (!sessionStorage.getItem('greeted')) {
                    toast.success("Welcome back to your dashboard!");
                    sessionStorage.setItem('greeted', 'true');
                }
            }).catch(err => {
                console.error(err);
                toast.error("Failed to load dashboard data");
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) {
        return (
            <div className="dashboard-content" style={{ padding: '2rem' }}>
                <Skeleton width="300px" height="40px" className="mb-4" />
                <Skeleton width="400px" height="20px" className="mb-8" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <Skeleton height="120px" />
                    <Skeleton height="120px" />
                    <Skeleton height="120px" />
                    <Skeleton height="120px" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <Skeleton height="350px" />
                    <Skeleton height="350px" />
                </div>
            </div>
        );
    }

    const report = userStats?.weeklyReport || {};
    const goals = userStats?.stats?.goals || { targetPages: 10, targetTime: 1800, targetActivity: 50 };
    const myBadges = userStats?.stats?.badges || [];
    const myStreak = userStats?.stats?.streak || 0;

    const pageGoalPct = Math.min(100, Math.round(((report.pagesVisited || 0) / goals.targetPages) * 100)) || 0;
    const timeGoalPct = Math.min(100, Math.round(((report.totalTime || 0) / goals.targetTime) * 100)) || 0;
    const actGoalPct = Math.min(100, Math.round(((report.engageScore || 0) / goals.targetActivity) * 100)) || 0;

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateGoals(user._id || user.id, editingGoals);
            toast.success("Goals updated!");
            setShowGoalModal(false);
            // Refresh stats
            getUserStats(user._id || user.id).then(data => setUserStats(data));
        } catch (err) {
            toast.error("Failed to update goals");
        }
    };

    const openGoalModal = () => {
        setEditingGoals({
            targetPages: goals.targetPages,
            targetTime: goals.targetTime,
            targetActivity: goals.targetActivity
        });
        setShowGoalModal(true);
    };

    const handleMarkAllRead = async () => {
        try {
            await markNotificationsAsRead(user._id || user.id);
            const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
            setNotifications(updatedNotifs);
            toast.success("Notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark read");
        }
    };

    return (
        <div className="dashboard-content" style={{ paddingBottom: '3rem' }}>
            <style>{`
                .pulse { animation: pulseAnim 2s infinite; }
                @keyframes pulseAnim { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: translateY(-5px); }
                .progress-bg { background-color: rgba(255,255,255,0.1); border-radius: 999px; height: 8px; overflow: hidden; margin-top: 0.5rem; }
                .progress-bar { height: 100%; border-radius: 999px; transition: width 1s ease-out; }
                .badge-icon { background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 50%; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; }
                .badge-icon.earned { border-color: var(--warning); background: rgba(255,193,7,0.1); color: var(--warning); box-shadow: 0 0 15px rgba(255,193,7,0.2); }
            `}</style>

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">My Dashboard <span className="pulse" style={{ fontSize: '1rem', backgroundColor: 'rgba(255,193,7,0.15)', color: 'var(--warning)', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={14} /> {myStreak} Day Streak</span></h1>
                    <p className="page-subtitle">Track your personal activity, goals, and achievements.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }} className="pulse"></div>
                        <span style={{ fontSize: '0.85rem' }}><AnimatedCounter value={activeUsers} /> Active Users</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="btn btn-secondary" style={{ position: 'relative', padding: '0.5rem', display: 'flex' }} onClick={() => setShowNotifs(!showNotifs)}>
                            <Bell size={20} />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span style={{ position: 'absolute', top: -3, right: -3, backgroundColor: 'var(--danger)', width: 14, height: 14, borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>
                        {showNotifs && (
                            <div className="glass-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 300, zIndex: 100, padding: 0 }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Notifications
                                    <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>Mark all read</button>
                                </div>
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <Bell size={24} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                                            <p>No new notifications.</p>
                                        </div>
                                    ) : notifications.map((n, i) => (
                                        <div key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: n.read ? 'transparent' : 'rgba(99,102,241,0.05)', position: 'relative' }}>
                                            {!n.read && <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></div>}
                                            <div style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.7rem' }}>{n.type.toUpperCase()}</div>
                                            <p style={{ margin: 0 }}>{n.message}</p>
                                            <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', opacity: 0.4 }}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Suggestion Bar */}
            <div className="glass-panel hover-scale" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BrainCircuit color="var(--accent-color)" size={24} />
                <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Smart Suggestion</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{insights[0]?.text}</p>
                </div>
            </div>

            {/* Weekly Report & Daily Goals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Performance Card */}
                <div className="glass-panel hover-scale" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="chart-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} color="var(--accent-color)" /> Weekly Report</h2>
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Top {report.percentile}%</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Session Time</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}><AnimatedCounter value={Math.floor(report.totalTime / 60)} />m</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Pages Visited</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}><AnimatedCounter value={report.pagesVisited} /></div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Engagement Score</div>
                            <div style={{ fontSize: '2rem', color: 'var(--warning)', fontWeight: 700 }}><AnimatedCounter value={report.engageScore} /></div>
                        </div>
                    </div>
                </div>

                {/* Goals Tracker */}
                <div className="glass-panel hover-scale" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Target size={18} color="var(--success)" /> Daily Goals Tracker
                        </h2>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }} onClick={openGoalModal}>
                            Set Goals
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>Visit {goals.targetPages} Pages</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{report.pagesVisited} / {goals.targetPages}</span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-bar" style={{ width: `${pageGoalPct}%`, backgroundColor: 'var(--accent-color)' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>Session Time ({goals.targetTime / 60}m)</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{Math.floor(report.totalTime / 60)} / {goals.targetTime / 60}m</span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-bar" style={{ width: `${timeGoalPct}%`, backgroundColor: 'var(--info)' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>Engagement Goal ({goals.targetActivity})</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{report.engageScore} / {goals.targetActivity}</span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-bar" style={{ width: `${actGoalPct}%`, backgroundColor: 'var(--warning)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Timeline */}
                <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                    <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)', paddingBottom: '0.5rem', zIndex: 10 }}>
                        <History size={18} /> Activity Timeline
                    </h2>
                    <div style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                        {timeline.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p> : timeline.map((entry, idx) => (
                            <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'absolute', left: '-1.45rem', top: '0.2rem', width: '0.8rem', height: '0.8rem', borderRadius: '50%', backgroundColor: 'var(--accent-color)', border: '2px solid var(--bg-primary)' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{entry.time}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{entry.action}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.events}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements Badge System */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
                        <Award size={18} color="var(--warning)" /> Badges & Achievements
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: myBadges.includes('First Visit') ? 1 : 0.4, cursor: 'pointer' }} onClick={() => myBadges.includes('First Visit') && confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })}>
                            <div className={`badge-icon ${myBadges.includes('First Visit') ? 'earned' : ''}`}><Medal size={24} /></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>First Visit</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: myBadges.includes('7 Day Streak') ? 1 : 0.4, cursor: 'pointer' }} onClick={() => myBadges.includes('7 Day Streak') && confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })}>
                            <div className={`badge-icon ${myBadges.includes('7 Day Streak') ? 'earned' : ''}`}><Flame size={24} /></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>7 Day Streak</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: myBadges.includes('10 Pages Visited') ? 1 : 0.4, cursor: 'pointer' }} onClick={() => myBadges.includes('10 Pages Visited') && confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })}>
                            <div className={`badge-icon ${myBadges.includes('10 Pages Visited') ? 'earned' : ''}`}><Map size={24} /></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Explorer</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: myBadges.includes('High Engagement Score') ? 1 : 0.4, cursor: 'pointer' }} onClick={() => myBadges.includes('High Engagement Score') && confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })}>
                            <div className={`badge-icon ${myBadges.includes('High Engagement Score') ? 'earned' : ''}`}><Star size={24} /></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Top Engaged</span>
                        </div>

                    </div>
                </div>

                {/* Leaderboard */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Users size={18} color="var(--info)" /> Leaderboard
                        </h2>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {['Today', 'Week', 'Month'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px', backgroundColor: filter === f ? 'var(--info)' : 'transparent', color: filter === f ? '#fff' : 'inherit', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {leaderboard.slice(0, 5).map((userL, idx) => {
                            // Mock factor based on filter to show it "working"
                            const scoreMultiplier = filter === 'Month' ? 3.5 : filter === 'Week' ? 1.8 : 1;
                            const displayScore = Math.floor(userL.score * scoreMultiplier);
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: userL.name === user.name ? 'rgba(255,193,7,0.1)' : 'rgba(255,255,255,0.02)', border: userL.name === user.name ? '1px solid var(--warning)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: idx === 0 ? 'var(--warning)' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#b45309' : 'var(--text-secondary)', width: '20px', textAlign: 'center' }}>
                                            {idx + 1}
                                        </span>
                                        <span style={{ fontWeight: userL.name === user.name ? 600 : 400 }}>{userL.name === user.name ? 'You' : userL.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}><AnimatedCounter value={displayScore} /> pts</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Goal Setting Modal */}
            {showGoalModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Set Daily Goals</h2>
                        <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Target Pages</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={editingGoals.targetPages}
                                    onChange={e => setEditingGoals({ ...editingGoals, targetPages: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Target Time (minutes)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={editingGoals.targetTime / 60}
                                    onChange={e => setEditingGoals({ ...editingGoals, targetTime: (parseInt(e.target.value) || 0) * 60 })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Engagement Goal</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={editingGoals.targetActivity}
                                    onChange={e => setEditingGoals({ ...editingGoals, targetActivity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Goals</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowGoalModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
