const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pageVisited: { type: String, required: true },
    sessionTime: { type: Number, required: true }, // in seconds
    clicks: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
