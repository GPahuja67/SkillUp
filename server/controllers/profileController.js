// server/controllers/profileController.js
const Profile = require('../models/Profile');

exports.saveProfile = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Prevent duplicate profiles per user: update if exists, else create
        let existing = await Profile.findOne({ userId });
        if (existing) {
            // update fields from body (only allowed fields)
            const allowed = ['interests','learningTime','sessionDuration','location','skillLevel','goals','profilePicture','expertiseSkills','portfolioFiles'];
            allowed.forEach(k => { if (req.body[k] !== undefined) existing[k] = req.body[k]; });
            await existing.save();
            return res.status(200).json({ message: 'Profile updated', profile: existing });
        }

        const profileData = { ...req.body, userId };
        const newProfile = new Profile(profileData);
        await newProfile.save();
        res.status(201).json({ message: 'Profile saved successfully!', profile: newProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving profile', details: err.message });
    }
};

exports.getProfiles = async (req, res) => {
    try {
        // public listing: include user name/email for display (populated)
        const profiles = await Profile.find().populate('userId', 'name email');
        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching profiles', details: err.message });
    }
};
