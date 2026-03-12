import React, { useEffect, useState } from 'react';
import { getAnalytics, getUsers, getActivities, getInsights, triggerAutomation } from '../services/api';
import { Users, Activity, BarChart2, TrendingUp, Clock, MousePointerClick, BrainCircuit, PlayCircle, MousePointer2, AlertTriangle, Info, Zap, Settings2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [allActivities, setAllActivities] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [automationStatus, setAutomationStatus] = useState('');

    useEffect(() => {
        // Analytics for Admin
        Promise.all([
            getAnalytics(),
            getUsers(),
            getActivities(),
            getInsights()
        ]).then(([analyticsData, usersData, activitiesData, insightsData]) => {
            setStats(analyticsData);
            setAllUsers(usersData);
            setAllActivities(activitiesData);
            setInsights(insightsData || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const exportToCSV = () => {
        if (!allActivities || allActivities.length === 0) return;
        const headers = ["User ID,Page Visited,Time Spent(s),Interactions,Date"];
        const rows = allActivities.map(act =>
            `${act.user_id},${act.page_visited},${act.session_time},${act.clicks},${new Date(act.date).toLocaleDateString()}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_activity.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exported successfully!", { icon: '📊' });
    };

    const handleTriggerAutomation = async () => {
        if (!webhookUrl) return toast.error("Please enter a Webhook URL");
        setAutomationStatus('Triggering...');
        try {
            await triggerAutomation(webhookUrl, {
                admin: "System",
                action: "Manual Test",
                summary: "Standard platform health check triggered manually from Admin Dashboard."
            });
            toast.success("n8n Workflow Triggered!");
            setAutomationStatus('Success!');
            setTimeout(() => setAutomationStatus(''), 3000);
        } catch (err) {
            toast.error("Automation failed. Check URL.");
            setAutomationStatus('Failed');
        }
    };

    const metricCards = [
        { title: 'Active Sessions', value: stats?.activeSessions || 0, icon: <Activity size={24} color="var(--success)" />, trend: 'Live', isUp: true },
        { title: 'Daily Users', value: stats?.dailyUsers || 0, icon: <Users size={24} color="var(--accent-color)" />, trend: '+5%', isUp: true },
        { title: 'Weekly Users', value: stats?.weeklyUsers || 0, icon: <Activity size={24} color="var(--success)" />, trend: '+12%', isUp: true },
        { title: 'Retention Rate', value: stats?.retentionRate || '0%', icon: <TrendingUp size={24} color="var(--info)" />, trend: '+2%', isUp: true },
        { title: 'Engagement Score', value: stats?.engagementScore || 0, icon: <TrendingUp size={24} color="var(--danger)" />, trend: '+15%', isUp: true },
    ];

    // Mock data for graphs
    const dailyActivity = [
        { name: 'Mon', active: 400, new: 240 },
        { name: 'Tue', active: 300, new: 139 },
        { name: 'Wed', active: 200, new: 980 },
        { name: 'Thu', active: 278, new: 390 },
        { name: 'Fri', active: 189, new: 480 },
        { name: 'Sat', active: 239, new: 380 },
        { name: 'Sun', active: 349, new: 430 },
    ];

    const engagementTrend = [
        { name: 'Mar 1', score: 65 },
        { name: 'Mar 2', score: 59 },
        { name: 'Mar 3', score: 80 },
        { name: 'Mar 4', score: 81 },
        { name: 'Mar 5', score: 90 },
        { name: 'Mar 6', score: 85 },
    ];

    const roleData = [
        { name: 'Admins', value: allUsers.filter(u => u.role === 'Admin').length || 1 },
        { name: 'Users', value: allUsers.filter(u => u.role === 'User').length || 2 }
    ];
    const PIE_COLORS = ['var(--accent-color)', 'var(--success)', 'var(--warning)'];

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-primary)' }}>Loading dashboard data...</div>;
    }

    return (
        <div className="dashboard-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Admin Hub</h1>
                    <p className="page-subtitle">Platform overview and user analytics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/heatmap" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <MousePointer2 size={16} /> Heatmaps
                    </Link>
                    <Link to="/admin/replays" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <PlayCircle size={16} /> Session Replays
                    </Link>
                    <button onClick={exportToCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <BrainCircuit color="var(--accent-color)" size={24} />
                    <h2 className="chart-title" style={{ margin: 0 }}>AI Tracking Insights</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {insights.map(insight => (
                        <div key={insight.id} style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            border: `1px solid ${insight.type === 'alert' ? 'var(--danger)' : insight.type === 'warning' ? 'var(--warning)' : 'var(--info)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                {insight.type === 'alert' && <AlertTriangle size={16} color="var(--danger)" />}
                                {insight.type === 'warning' && <AlertTriangle size={16} color="var(--warning)" />}
                                {insight.type === 'info' && <Info size={16} color="var(--info)" />}
                                {insight.type === 'insight' && <Zap size={16} color="var(--accent-color)" />}
                                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{insight.type} (Confidence: {insight.confidence}%)</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{insight.text}</p>
                        </div>
                    ))}
                    {insights.length === 0 && <p>No insights generated yet. Let AI analyze more traffic data.</p>}
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Settings2 color="#f59e0b" size={24} />
                    <h2 className="chart-title" style={{ margin: 0 }}>Automation Hub (n8n Integration)</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Workflow Webhook URL</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="https://n8n.yourdomain.com/webhook/..."
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleTriggerAutomation}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#f59e0b', color: 'white', marginBottom: '2px' }}
                        disabled={automationStatus === 'Triggering...'}
                    >
                        {automationStatus || 'Trigger n8n Workflow'}
                    </button>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100%' }}>
                        Trigger external automations like Slack alerts, email sequences, or data syncs via n8n.
                    </p>
                </div>
            </div>

            <div className="metrics-grid">
                {metricCards.map((metric, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="metric-card glass-panel"
                    >
                        <div className="metric-header">
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{metric.title}</span>
                            {metric.icon}
                        </div>
                        <div className="metric-value">{metric.value}</div>
                        <div className={`metric-trend ${metric.isUp ? 'trend-up' : 'trend-down'}`}>
                            {metric.trend} this week
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="chart-card glass-panel">
                    <h2 className="chart-title">Activity Overview</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                            <Bar dataKey="active" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="new" fill="var(--success)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card glass-panel">
                    <h2 className="chart-title">Platform Engagement Score</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={engagementTrend}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                            <Area type="monotone" dataKey="score" stroke="var(--accent-color)" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card glass-panel" style={{ gridColumn: 'span 2' }}>
                    <h2 className="chart-title">Top Visited Pages</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.topPages || []} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="var(--text-secondary)" />
                            <YAxis type="category" dataKey="page" stroke="var(--text-secondary)" width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                            <Bar dataKey="visits" fill="var(--success)" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 1' }}>
                    <h2 className="chart-title">User Role Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-primary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="table-card glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1.5rem' }}>
                    <h2 className="chart-title" style={{ margin: 0 }}>Recent Activity Log</h2>
                    <button
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                    >
                        {showAllActivities ? 'View Less' : 'View All'}
                    </button>
                </div>
                <div className="table-responsive" style={{ maxHeight: showAllActivities ? '400px' : 'auto', overflowY: showAllActivities ? 'auto' : 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Page Visited</th>
                                <th>Time Spent</th>
                                <th>Interactions</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(showAllActivities ? allActivities : allActivities.slice(0, 5)).map(act => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={act.id}
                                >
                                    <td>#{act.user_id}</td>
                                    <td><span style={{ fontFamily: 'monospace' }}>{act.page_visited}</span></td>
                                    <td>{Math.floor(act.session_time / 60)}m {act.session_time % 60}s</td>
                                    <td>{act.clicks} clicks</td>
                                    <td>{new Date(act.date).toLocaleDateString()}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;
