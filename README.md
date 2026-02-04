# SyncText
![SyncText Hero Banner](https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/banner.jpg)

> **Real-time collaboration and messaging platform built for the modern web.** > SyncText is a full-stack MERN application featuring instant messaging, room management, and a seamless cross-device experience.

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_SyncText-blue?style=for-the-badge&logo=vercel)](https://sync-text.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 🚀 Live Demo
Experience the app live: **[https://sync-text.vercel.app](https://sync-text.vercel.app)**

---

## 📸 Desktop Interface

| **Modern Authentication** | **Real-Time Dashboard** |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/auth.png" width="400" alt="Login Page"> | <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/dasboard_main.png" width="400" alt="Dashboard"> |
| *Split-screen design with glassmorphism effects* | *Persistent rooms and unread message indicators* |

| **Immersive Chat Experience** |
|:---:|
| <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/dashboard.png" width="850" alt="Chat Interface"> |
| *Rich features including typing indicators, emojis, and sound effects* |

---

## 📱 Mobile Responsiveness
SyncText is fully optimized for mobile devices with an app-like navigation flow.

| **Room List** | **Active Chat** | **Member Details** |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/dashboard_mobile2.png" width="250" alt="Mobile Room List"> | <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/dashboard_mobile.png" width="250" alt="Mobile Chat View"> | <img src="https://raw.githubusercontent.com/NurG001/mine/refs/heads/main/project%20img/chat-app/dashboard_mobile3.png" width="250" alt="Mobile Members Overlay"> |
| *Clean list view with unread badges* | *Full-screen chat with back navigation* | *Slide-over overlay for member info* |

---

## ✨ Key Features

### 🔐 **Authentication & Security**
* **Secure Auth Flow:** Registration and Login with Bcrypt password hashing.
* **Session Persistence:** Users stay logged in via LocalStorage even after refreshing.
* **Glassmorphism UI:** A polished, dark-themed login interface with animated backgrounds.

### 💬 **Real-Time Messaging**
* **Instant Sync:** Powered by **Socket.io** for zero-latency communication.
* **Typing Indicators:** See when others are typing in real-time.
* **Audio Feedback:** Custom sound effects for sent and received messages.
* **Rich Media:** Integrated Emoji Picker for expressive conversations.

### 🏠 **Room Management**
* **Persistent Rooms:** Joined rooms are saved to your MongoDB profile and load instantly on login.
* **Unread Badges:** Red notification counters (`🔴 3`) alert you to activity in other rooms.
* **Leave Room:** Users can permanently exit rooms using the "Trash" icon.
* **Member Lists:** View real-time online/offline status of all room members.

### 📱 **Responsive Design**
* **Mobile-First Logic:** Custom state management handles navigation between Room List, Chat, and Info screens on mobile.
* **Notification Dots:** A pinging red dot on the back arrow alerts mobile users to unread messages in other rooms.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Emoji Picker React
* **Backend:** Node.js, Express.js
* **Real-Time Engine:** Socket.io (WebSockets)
* **Database:** MongoDB Atlas (Mongoose)
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## ⚙️ Installation & Setup

Follow these steps to run SyncText locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/synctext-chat.git](https://github.com/YOUR_USERNAME/synctext-chat.git)
cd synctext-chat

```

### 2. Backend Setup

```bash
cd server
npm install

```

Create a `.env` file in the `server` folder:

```env
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
PORT=3001

```

Start the server:

```bash
npm run dev

```

### 3. Frontend Setup

Open a new terminal and go to the client folder:

```bash
cd client
npm install

```

Create a `.env` file in the `client` folder:

```env
VITE_SERVER_URL=http://localhost:3001

```

Start the client:

```bash
npm run dev

```

Visit `http://localhost:5173` in your browser.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

## 📄 License

This project is licensed under the MIT License.

<div align="center">
<sub>Built with ❤️ by Ismail Mahmud Nur</sub>
</div>

```

```
