const mongoose = require('mongoose');

const HeatmapClickSchema = new mongoose.Schema({
    pageUrl: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    viewportWidth: {
        type: Number,
        required: true
    },
    viewportHeight: {
        type: Number,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HeatmapClick', HeatmapClickSchema);
