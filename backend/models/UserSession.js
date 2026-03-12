const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in seconds
        default: 0
    }
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
