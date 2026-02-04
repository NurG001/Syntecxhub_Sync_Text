// server/index.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("CONNECTED TO MONGODB ATLAS"))
    .catch((err) => console.log("MongoDB Error:", err));

// === AUTH ROUTES ===
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.json({ success: false, message: "Username taken" });
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword, joinedRooms: [] }).save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        res.json({ success: true, username: user.username, joinedRooms: user.joinedRooms });
    } catch (err) { res.status(500).json({ success: false, message: "Error" }); }
});

// === SERVER SETUP ===
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5174", methods: ["GET", "POST"] }
});

let onlineUsers = new Set();

io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // === UPDATED: USER LOGIN ===
    socket.on("user_login", async (username) => {
        console.log(`${username} came online.`);
        socket.username = username;
        onlineUsers.add(username);
        io.emit("update_online_status", Array.from(onlineUsers));

        // FIX: Fetch joined rooms from DB and send to frontend immediately
        try {
            const user = await User.findOne({ username });
            if (user) {
                socket.emit("update_my_rooms", user.joinedRooms);
            }
        } catch (error) {
            console.error("Error fetching user rooms:", error);
        }
    });

    socket.on("user_logout", () => {
        if (socket.username) {
            onlineUsers.delete(socket.username);
            io.emit("update_online_status", Array.from(onlineUsers));
        }
    });

    socket.on("join_room", async ({ room, username }) => {
        socket.join(room);
        
        await User.findOneAndUpdate(
            { username }, 
            { $addToSet: { joinedRooms: room } } 
        );

        let roomData = await Room.findOne({ roomId: room });
        if (!roomData) {
            roomData = new Room({ roomId: room, members: [] });
        }
        if (!roomData.members.includes(username)) {
            roomData.members.push(username);
            await roomData.save();
        }

        const user = await User.findOne({ username });
        socket.emit("update_my_rooms", user.joinedRooms); 
        
        io.to(room).emit("update_room_members", { room, members: roomData.members });

        const history = await Message.find({ room });
        socket.emit("load_history", history);
    });

// === NEW: LEAVE ROOM ===
    socket.on("leave_room", async ({ room, username }) => {
        try {
            console.log(`${username} left room: ${room}`);

            // 1. Remove room from User's list
            await User.findOneAndUpdate(
                { username },
                { $pull: { joinedRooms: room } }
            );

            // 2. Remove user from Room's member list
            const roomData = await Room.findOneAndUpdate(
                { roomId: room },
                { $pull: { members: username } },
                { new: true } // Return updated doc
            );

            // 3. Socket leaves the channel
            socket.leave(room);

            // 4. Update the User's Sidebar
            const user = await User.findOne({ username });
            socket.emit("update_my_rooms", user ? user.joinedRooms : []);

            // 5. Update the Room's Member List (for others still in there)
            if (roomData) {
                io.to(room).emit("update_room_members", { room, members: roomData.members });
            }

        } catch (err) {
            console.log("Error leaving room:", err);
        }
    });


    socket.on("send_message", async (data) => {
        const newMessage = new Message(data);
        await newMessage.save();
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("typing", (data) => socket.to(data.room).emit("display_typing", data));
    socket.on("stop_typing", (room) => socket.to(room).emit("hide_typing"));

    socket.on("disconnect", () => {
        if (socket.username) {
            onlineUsers.delete(socket.username); 
            io.emit("update_online_status", Array.from(onlineUsers)); 
        }
    });
});

server.listen(3001, () => console.log("SERVER RUNNING ON 3001"));