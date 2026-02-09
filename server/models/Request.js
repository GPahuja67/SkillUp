// server/models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        offeredSkill: { type: String, required: true },
        requestedSkill: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Request', RequestSchema);

