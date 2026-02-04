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

// Allow connections from both your local test and your deployed frontend
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", process.env.CLIENT_URL], 
    methods: ["GET", "POST"]
}));

app.use(express.json());

// === NEW: SERVER STATUS PAGE ===
// This fixes the "Cannot GET /" error by serving a nice HTML page
app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SyncText Server</title>
          <style>
            body {
              background-color: #0f172a;
              color: white;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 50px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 20px 50px rgba(0,0,0,0.5);
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 2.5rem; margin-bottom: 10px; }
            .status {
              color: #4ade80; 
              font-weight: bold;
              font-size: 1.2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .dot {
              width: 10px;
              height: 10px;
              background-color: #4ade80;
              border-radius: 50%;
              box-shadow: 0 0 10px #4ade80;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>SyncText Server</h1>
            <div class="status">
              <div class="dot"></div>
              System Operational
            </div>
            <p style="color: #94a3b8; margin-top: 20px;">Ready to accept Socket.io connections</p>
          </div>
        </body>
      </html>
    `);
});

// === DATABASE CONNECTION ===
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
    cors: {
        origin: "*", // Allow connections from anywhere (easiest for deployment)
        methods: ["GET", "POST"]
    }
});

let onlineUsers = new Set();

io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("user_login", async (username) => {
        console.log(`${username} came online.`);
        socket.username = username;
        onlineUsers.add(username);
        io.emit("update_online_status", Array.from(onlineUsers));

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

    socket.on("leave_room", async ({ room, username }) => {
        try {
            await User.findOneAndUpdate({ username }, { $pull: { joinedRooms: room } });
            const roomData = await Room.findOneAndUpdate({ roomId: room }, { $pull: { members: username } }, { new: true });
            socket.leave(room);
            const user = await User.findOne({ username });
            socket.emit("update_my_rooms", user ? user.joinedRooms : []);
            if (roomData) {
                io.to(room).emit("update_room_members", { room, members: roomData.members });
            }
        } catch (err) { console.log("Error leaving room:", err); }
    });

    socket.on("join_room", async ({ room, username }) => {
        socket.join(room);
        await User.findOneAndUpdate({ username }, { $addToSet: { joinedRooms: room } });
        let roomData = await Room.findOne({ roomId: room });
        if (!roomData) { roomData = new Room({ roomId: room, members: [] }); }
        if (!roomData.members.includes(username)) { roomData.members.push(username); await roomData.save(); }
        const user = await User.findOne({ username });
        socket.emit("update_my_rooms", user.joinedRooms); 
        io.to(room).emit("update_room_members", { room, members: roomData.members });
        const history = await Message.find({ room });
        socket.emit("load_history", history);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});