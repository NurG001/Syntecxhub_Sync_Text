// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    joinedRooms: [{ type: String }] // <--- NEW: List of rooms user is part of
});

module.exports = mongoose.model("User", userSchema);