// server/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    members: [{ type: String }] // List of usernames who joined this room
});

module.exports = mongoose.model("Room", roomSchema);