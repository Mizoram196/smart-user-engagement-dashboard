const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    targetPages: { type: Number, default: 10 },
    targetTime: { type: Number, default: 1800 }, // seconds (30 mins)
    targetActivity: { type: Number, default: 50 } // engagement score target
});

const userStatsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    goals: { type: goalSchema, default: () => ({}) },
    badges: { type: [String], default: [] }
});

module.exports = mongoose.model('UserStats', userStatsSchema);
