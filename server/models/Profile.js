const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },   // <--- ADD THIS
    interests: [String],
    learningTime: String,
    sessionDuration: Number,
    location: String,
    skillLevel: String,
    goals: String,
    profilePicture: String,
    expertiseSkills: String,
    portfolioFiles: [String],
}, { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);
