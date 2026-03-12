const mongoose = require('mongoose');

const SessionReplayChunkSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    pageUrl: {
        type: String
    },
    // Compressed array of interaction events to save space
    compressedData: {
        type: Buffer,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('SessionReplayChunk', SessionReplayChunkSchema);
