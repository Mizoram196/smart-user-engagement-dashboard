const mongoose = require('mongoose');

const PageVisitSchema = new mongoose.Schema({
    pageUrl: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('PageVisit', PageVisitSchema);
