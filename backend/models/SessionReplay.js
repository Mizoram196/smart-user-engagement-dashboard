const mongoose = require('mongoose');

const SessionReplaySchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    pageUrl: {
        type: String
    },
    // We will store the compressed event log as a Buffer or Base64 string to save space
    eventsData: {
        type: Buffer
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    }
});

module.exports = mongoose.model('SessionReplay', SessionReplaySchema);
