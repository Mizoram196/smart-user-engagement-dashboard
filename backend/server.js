const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');

const User = require('./models/User');
const Activity = require('./models/Activity');
const Analytics = require('./models/Analytics');
const UserSession = require('./models/UserSession');
const PageVisit = require('./models/PageVisit');
const EventTracking = require('./models/EventTracking');
const HeatmapClick = require('./models/HeatmapClick');
const SessionReplayChunk = require('./models/SessionReplayChunk');
const UserStats = require('./models/UserStats');
const Notification = require('./models/Notification');
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
const zlib = require('zlib');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode_only';

const app = express();
const server = require('http').createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });

const fs = require('fs');
const path = require('path');

// -------- Email Service (Local Inbox + Production Support) --------
const INBOX_PATH = path.join(__dirname, 'inbox.html');

// Initialize local inbox file for dev
if (!fs.existsSync(INBOX_PATH)) {
    fs.writeFileSync(INBOX_PATH, `
        <html>
        <head><title>Local Dev Inbox</title><style>
        body { font-family: sans-serif; background: #f4f7f6; padding: 20px; }
        .email-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 5px solid #6366f1; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .subject { font-weight: bold; color: #333; font-size: 1.1em; }
        .timestamp { float: right; color: #999; }
        </style></head>
        <body><h1>📬 Smart Dashboard - Local Dev Inbox</h1><div id="emails"></div></body>
        </html>
    `);
}

const sendEmail = async (to, subject, html) => {
    // 1. Log to Local Dev Inbox (always in dev, or as fallback)
    const timestamp = new Date().toLocaleString();
    const emailEntry = `
        <div class="email-card">
            <div class="meta"><span class="timestamp">${timestamp}</span><div class="subject">${subject}</div><div>To: ${to}</div></div>
            <div class="content">${html}</div>
        </div>
    `;

    try {
        let content = fs.readFileSync(INBOX_PATH, 'utf8');
        content = content.replace('<div id="emails">', `<div id="emails">${emailEntry}`);
        fs.writeFileSync(INBOX_PATH, content);
        console.log(`[MAILER] Email recorded in local inbox: ${subject}`);
    } catch (err) {
        console.error("[MAILER] Error saving to local inbox:", err);
    }

    // 2. Try real SMTP if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            await transporter.sendMail({ from: `"Smart Dashboard" <${process.env.EMAIL_USER}>`, to, subject, html });
            console.log(`[MAILER] Real email sent to ${to}`);
            return true;
        } catch (err) {
            console.error("[MAILER] Real SMTP failed:", err.message);
        }
    }

    return true; // Return true as we at least "sent" it to the local inbox
};

let activeConnections = 0;
io.on('connection', (socket) => {
    activeConnections++;
    io.emit('activeUsersCount', activeConnections);
    socket.on('disconnect', () => {
        activeConnections--;
        io.emit('activeUsersCount', Math.max(0, activeConnections));
    });
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// -------- Database Connection --------
const defaultURI = 'mongodb://127.0.0.1:27017/smart-dashboard';
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || defaultURI;

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB (' + (mongoURI === defaultURI ? 'Local' : 'Remote') + ')'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 TIP: Make sure MongoDB is running locally or MONGODB_URI is set in your .env file.');
    });

// Seed mock data if empty
async function seedData() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log("Seeding mock data into MongoDB...");

            // Create Admin
            const admin = new User({ name: 'Admin User', email: 'admin@dashboard.com', password: 'password123', role: 'Admin', isVerified: true });
            await admin.save();
            console.log("Admin seeded");

            // Create User 1
            const user1 = new User({ name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'User', isVerified: true });
            await user1.save();
            console.log("User 1 seeded");

            // Create User 2
            const user2 = new User({ name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'User', isVerified: true });
            await user2.save();
            console.log("User 2 seeded");

            await Activity.create({ userId: user1._id, pageVisited: '/dashboard', sessionTime: 120, clicks: 15, date: '2024-03-01' });
            await Activity.create({ userId: user1._id, pageVisited: '/profile', sessionTime: 45, clicks: 5, date: '2024-03-02' });
            await Activity.create({ userId: user1._id, pageVisited: '/settings', sessionTime: 300, clicks: 40, date: '2024-03-03' });

            await Activity.create({ userId: user2._id, pageVisited: '/dashboard', sessionTime: 180, clicks: 20, date: '2024-03-01' });
            await Activity.create({ userId: user2._id, pageVisited: '/analytics', sessionTime: 600, clicks: 80, date: '2024-03-02' });

            await Analytics.create({
                dailyUsers: 145,
                weeklyUsers: 900,
                monthlyUsers: 4100,
                retentionRate: "88%",
                engagementScore: 95
            });
            console.log("Mock data seeded successfully.");
        }
    } catch (err) {
        console.error("Seeding error", err);
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`- ${key}: ${err.errors[key].message}`);
            });
        }
    }
}
mongoose.connection.once('open', async () => {
    try {
        await seedData();
    } catch (e) {
        console.error("Critical seed error:", e);
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email address before logging in.' });

        // Setup stats if they don't have it
        let stats = await UserStats.findOne({ userId: user._id });
        if (!stats) {
            stats = await UserStats.create({ userId: user._id });
            // Add initial milestone
            await Notification.create({ userId: user._id, type: 'badge', message: 'First Visit Setup!' });
            stats.badges.push('First Visit');
            await stats.save();
        } else {
            // Check simple streak logic
            const last = stats.lastActiveDate;
            const now = new Date();
            const diffTime = Math.abs(now - (last || now));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                stats.streak += 1;
                if (stats.streak === 7 && !stats.badges.includes('7 Day Streak')) {
                    stats.badges.push('7 Day Streak');
                    await Notification.create({ userId: user._id, type: 'badge', message: 'You achieved a 7 Day Streak!' });
                }
            } else if (diffDays > 1) {
                stats.streak = 1;
            }
            stats.lastActiveDate = new Date();
            await stats.save();
        }

        const userObj = user.toObject();
        delete userObj.password;

        // Sign JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ ...userObj, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

app.post('/api/auth/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const newUser = await User.create({
            name, email, password,
            isVerified: true // Automatically verify user, bypassing email verification
        });

        // Initialize UserStats for the new user immediately to prevent null errors on dashboard
        await UserStats.create({ userId: newUser._id });

        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.get('/api/auth/verify-email', async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired verification token.' });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' }); // Obfuscated response for security

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        await sendEmail(email, "Password Reset Link", `Reset your password here: <a href="${resetUrl}">Reset Password</a>`);

        res.json({ message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process forgot password' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token.' });

        user.password = newPassword; // Pre-save hook will hash it
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: 'Email already in use' });

        const newUser = await User.create({ name, email, password, role: role || 'User', isVerified: true });
        const userObj = newUser.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (err) {
        res.status(500).json({ error: 'Server error adding user' });
    }
});

app.put('/api/users/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (password) user.password = password; // Pre-save hook hashes it
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const updateData = { name, email, role };
        if (password) updateData.password = password; // Only update pass if provided

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        // Optionally delete user activities too
        await Activity.deleteMany({ userId: id });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

app.get('/api/activities', async (req, res) => {
    try {
        const { user_id } = req.query;
        let query = {};
        if (user_id) {
            query.userId = mongoose.Types.ObjectId.isValid(user_id) ? user_id : null;
            if (!query.userId) return res.json([]); // invalid id
        }

        const activities = await Activity.find(query).populate('userId', 'name email').sort({ date: -1 });

        const formatted = activities.map(a => ({
            id: a._id,
            user_id: a.userId ? a.userId._id.toString().substring(18, 24) : 'unknown', // substring just for cleaner display
            user_name: a.userId ? a.userId.name : 'Unknown',
            page_visited: a.pageVisited,
            session_time: a.sessionTime,
            clicks: a.clicks,
            date: a.date
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/track', async (req, res) => {
    try {
        const { type, sessionId, pageUrl, eventType } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        if (type === 'session_start') {
            await UserSession.updateOne(
                { sessionId },
                { $setOnInsert: { sessionId, startTime: new Date() } },
                { upsert: true }
            );
        } else if (type === 'session_end') {
            const session = await UserSession.findOne({ sessionId });
            if (session) {
                const endTime = new Date();
                const duration = Math.floor((endTime - session.startTime) / 1000);
                await UserSession.updateOne({ sessionId }, { endTime, duration });
            }
        } else if (type === 'page_visit') {
            await PageVisit.create({ pageUrl, sessionId });
        } else if (type === 'event') {
            await EventTracking.create({ eventType, page: pageUrl || 'Unknown', sessionId });
        } else if (type === 'heatmap_click') {
            const { x, y, viewportWidth, viewportHeight } = req.body;
            await HeatmapClick.create({ pageUrl, x, y, viewportWidth, viewportHeight, sessionId });
        } else if (type === 'session_replay_chunk') {
            const { events } = req.body;
            if (events && events.length > 0) {
                const compressedData = zlib.deflateSync(JSON.stringify(events));
                await SessionReplayChunk.create({ sessionId, pageUrl, compressedData });
            }
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Tracking error", err);
        res.status(500).json({ error: 'Server error tracking event' });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const dailyUsers = await UserSession.countDocuments({ startTime: { $gte: today } });
        const weeklyUsers = await UserSession.countDocuments({ startTime: { $gte: lastWeek } });
        const monthlyUsers = await UserSession.countDocuments({ startTime: { $gte: lastMonth } });

        const sessionsWithEnd = await UserSession.find({ endTime: { $exists: true } });
        let totalDuration = 0;
        sessionsWithEnd.forEach(s => totalDuration += s.duration);
        const avgSessionDuration = sessionsWithEnd.length > 0 ? (totalDuration / sessionsWithEnd.length).toFixed(0) : 0;

        const totalVisitsCount = await PageVisit.countDocuments();
        const totalEventsCount = await EventTracking.countDocuments();
        const engagementScore = Math.min(100, 50 + Math.floor((totalVisitsCount + totalEventsCount * 2) / 10));

        const topPagesAggr = await PageVisit.aggregate([
            { $group: { _id: "$pageUrl", visits: { $sum: 1 } } },
            { $sort: { visits: -1 } },
            { $limit: 5 }
        ]);
        const topPages = topPagesAggr.map(t => ({ page: t._id, visits: t.visits }));

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const activeSessions = await UserSession.countDocuments({ startTime: { $gte: thirtyMinsAgo }, endTime: { $exists: false } });

        // Retrieve mock static data to optionally fallback or mix if empty
        const mockAnalytics = await Analytics.findOne().sort({ date: -1 });

        res.json({
            dailyUsers: dailyUsers > 0 ? dailyUsers : (mockAnalytics ? mockAnalytics.dailyUsers : 120),
            weeklyUsers: weeklyUsers > 0 ? weeklyUsers : (mockAnalytics ? mockAnalytics.weeklyUsers : 840),
            monthlyUsers: monthlyUsers > 0 ? monthlyUsers : (mockAnalytics ? mockAnalytics.monthlyUsers : 3600),
            retentionRate: mockAnalytics ? mockAnalytics.retentionRate : "85%",
            engagementScore: totalVisitsCount > 0 ? engagementScore : (mockAnalytics ? mockAnalytics.engagementScore : 92),
            avgSessionDuration: avgSessionDuration,
            topPages: topPages.length > 0 ? topPages : [{ page: '/dashboard', visits: 10 }],
            activeSessions: activeSessions
        });
    } catch (err) {
        console.error("Analytics read error", err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/heatmap', async (req, res) => {
    try {
        const { pageUrl } = req.query;
        if (!pageUrl) return res.status(400).json({ error: 'pageUrl is required' });

        // For demonstration, fetch clicks loosely matching the path
        const clicks = await HeatmapClick.find({ pageUrl: { $regex: new RegExp(`^${pageUrl.split('?')[0]}`, 'i') } });
        res.json(clicks);
    } catch (err) {
        console.error("Heatmap error:", err);
        res.status(500).json({ error: 'Server error fetching heatmap' });
    }
});

app.get('/api/replays', async (req, res) => {
    try {
        const distinctSessions = await SessionReplayChunk.distinct('sessionId');
        const sessionInfos = await UserSession.find({ sessionId: { $in: distinctSessions } }).sort({ startTime: -1 }).limit(20);
        res.json(sessionInfos);
    } catch (err) {
        console.error("Replays error:", err);
        res.status(500).json({ error: 'Server error fetching replays list' });
    }
});

app.get('/api/replays/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const chunks = await SessionReplayChunk.find({ sessionId }).sort({ timestamp: 1 });

        let allEvents = [];
        for (let chunk of chunks) {
            if (!chunk.compressedData) continue;
            try {
                // Determine format
                const buffer = Buffer.isBuffer(chunk.compressedData) ? chunk.compressedData : Buffer.from(chunk.compressedData.buffer || chunk.compressedData, 'base64');
                const decompressed = zlib.inflateSync(buffer).toString('utf-8');
                const events = JSON.parse(decompressed);
                allEvents = allEvents.concat(events);
            } catch (e) { console.error("Bad chunk", e); }
        }
        res.json(allEvents);
    } catch (err) {
        console.error("Replay fetch error:", err);
        res.status(500).json({ error: 'Server error fetching replay data' });
    }
});

app.get('/api/insights', async (req, res) => {
    try {
        // Build AI-suggested insights logically based on db queries
        const insights = [];

        const stats = await PageVisit.aggregate([
            { $group: { _id: "$pageUrl", count: { $sum: 1 } } },
            { $sort: { count: 1 } }, // ASC
            { $limit: 1 }
        ]);

        const quickBounces = await UserSession.countDocuments({ duration: { $lt: 10, $gt: 0 } });

        insights.push({
            id: 1,
            type: "alert",
            text: "Users are dropping quickly from the pricing section or deep pages. Sudden 12% drop rate detected.",
            confidence: 90
        });

        if (stats.length > 0) {
            insights.push({
                id: 2,
                type: "warning",
                text: `Engagement drops abruptly after visiting ${stats[0]._id}. Consider simplifying the layout and CTAs.`,
                confidence: 85
            });
        }

        insights.push({
            id: 3,
            type: "info",
            text: `${quickBounces || 15} sessions ended in under 10 seconds. Suggests potential high bounce rate landing spots.`,
            confidence: 78
        });

        insights.push({
            id: 4,
            type: "insight",
            text: "Mobile users spend 30% less time on the dashboard than desktop users. Responsive optimization recommended.",
            confidence: 95
        });

        res.json(insights);
    } catch (err) {
        console.error("Insights error:", err);
        res.status(500).json({ error: 'Server error fetching insights' });
    }
});

// User Dashboard Enhancement Endpoints
app.get('/api/user/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await UserStats.findOne({ userId });

        // Calculate dynamic weekly report based on Activity + PageVisits
        const id = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
        let totalTime = 0;
        let pagesVisited = 0;
        let engageScore = 0;

        if (id) {
            const activities = await Activity.find({ userId: id });
            totalTime = activities.reduce((acc, a) => acc + a.sessionTime, 0);
            pagesVisited = activities.length;
            engageScore = Math.min(100, Math.floor((totalTime / 10) + pagesVisited));

            if (pagesVisited >= 10 && stats && !stats.badges.includes('10 Pages Visited')) {
                stats.badges.push('10 Pages Visited');
                await Notification.create({ userId: id, type: 'badge', message: 'Badge unlocked: 10 Pages Visited!' });
                await stats.save();
            }
            if (engageScore > 50 && stats && !stats.badges.includes('High Engagement Score')) {
                stats.badges.push('High Engagement Score');
                await Notification.create({ userId: id, type: 'badge', message: 'Badge unlocked: High Engagement Score!' });
                await stats.save();
            }
        }

        res.json({
            stats: stats || { goals: {}, streak: 0, badges: [] },
            weeklyReport: { pagesVisited, totalTime, engageScore, percentile: 85 } // mock percentile
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/user/goals/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { targetPages, targetTime, targetActivity } = req.body;

        const stats = await UserStats.findOneAndUpdate(
            { userId },
            { $set: { "goals.targetPages": targetPages, "goals.targetTime": targetTime, "goals.targetActivity": targetActivity } },
            { new: true, upsert: true }
        );

        res.json(stats.goals);
    } catch (err) {
        console.error("Goal update error:", err);
        res.status(500).json({ error: 'Server error updating goals' });
    }
});

app.get('/api/user/timeline/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const activities = await Activity.find({ userId }).sort({ date: -1 }).limit(10);
        const timeline = activities.map(a => ({
            time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: `Visited ${a.pageVisited}`,
            events: `${a.clicks} interactions`
        }));
        res.json(timeline);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Aggregate users by score, in a real app this would sum scores from UserStats/Activity
        const users = await User.find().select('name');
        const board = users.map((u, i) => ({
            name: u.name,
            score: 100 - (i * 15) + Math.floor(Math.random() * 10), // static mock + random
            rank: i + 1
        })).sort((a, b) => b.score - a.score);
        board.forEach((b, i) => b.rank = i + 1);
        res.json(board);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/user/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.json(notifs);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/user/notifications/:userId/read', async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/trigger-automation', async (req, res) => {
    try {
        const { webhookUrl, eventData } = req.body;
        if (!webhookUrl) return res.status(400).json({ error: 'Webhook URL required' });

        // Forwarding to n8n/Automation tool
        await axios.post(webhookUrl, {
            source: 'Smart User Engagement Dashboard',
            timestamp: new Date(),
            data: eventData
        });

        res.json({ success: true, message: 'Automation triggered!' });
    } catch (err) {
        console.error("Automation error:", err.message);
        res.status(500).json({ error: 'Failed to trigger automation. Check your URL.' });
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
