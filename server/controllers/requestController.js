// server/controllers/requestController.js
const Request = require('../models/Request');

exports.sendRequest = async (req, res) => {
    try {
        const sender = req.user && req.user.id;
        if (!sender) return res.status(401).json({ error: 'Unauthorized' });

        const { receiver, offeredSkill, requestedSkill } = req.body;
        if (!receiver || !offeredSkill || !requestedSkill) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const newReq = new Request({ sender, receiver, offeredSkill, requestedSkill });
        await newReq.save();
        res.status(201).json({ message: 'Request sent successfully!', request: newReq });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error sending request', details: err.message });
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const userId = req.params.id;
        const requests = await Request.find({
            $or: [{ sender: userId }, { receiver: userId }],
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email');

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching requests', details: err.message });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['pending', 'accepted', 'rejected'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const updated = await Request.findByIdAndUpdate(id, { status }, { new: true })
            .populate('sender', 'name email')
            .populate('receiver', 'name email');

        res.json({ message: 'Request updated', request: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating request', details: err.message });
    }
};
