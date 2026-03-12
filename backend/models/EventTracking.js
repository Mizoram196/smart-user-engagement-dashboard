const mongoose = require('mongoose');

const EventTrackingSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true
    },
    page: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: String
    }
});

module.exports = mongoose.model('EventTracking', EventTrackingSchema);
