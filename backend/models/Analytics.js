const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    dailyUsers: { type: Number, default: 0 },
    weeklyUsers: { type: Number, default: 0 },
    monthlyUsers: { type: Number, default: 0 },
    retentionRate: { type: String, default: "0%" },
    engagementScore: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
