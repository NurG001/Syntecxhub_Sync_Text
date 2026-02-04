import { useState, useEffect, useRef } from "react";
import EmojiPicker from 'emoji-picker-react';
import sentSoundFile from '/sent.mp3'; 
import receiveSoundFile from '/receive.mp3';

const Dashboard = ({ socket, username, logout }) => {
  // UI States
  const [activeRoom, setActiveRoom] = useState(null);
  const [myRooms, setMyRooms] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [onlineGlobal, setOnlineGlobal] = useState([]);
  const [mobileView, setMobileView] = useState("list"); 
  
  // === NEW: UNREAD COUNTS STATE ===
  const [unreadCounts, setUnreadCounts] = useState({}); 

  // Chat States
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState("");

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // === INIT ===
  useEffect(() => {
    socket.emit("user_login", username);

    socket.on("update_my_rooms", (rooms) => {
        setMyRooms(rooms);
        if (activeRoom && !rooms.includes(activeRoom)) {
            setActiveRoom(null);
            setMobileView("list");
        }
    });
    
    socket.on("update_online_status", (users) => setOnlineGlobal(users));
    
    socket.on("update_room_members", ({ room, members }) => {
      if (activeRoom === room) setRoomMembers(members);
    });

    // === UPDATED MESSAGE LISTENER ===
    socket.on("receive_message", (data) => {
        // 1. Play Sound (Always play if it's not me)
        if (data.author !== username) {
            new Audio(receiveSoundFile).play().catch(()=>{});
        }

        // 2. If message is for the ACTIVE room, show it
        if (data.room === activeRoom) {
            setMessages((prev) => [...prev, data]);
        } 
        // 3. If message is for ANOTHER room, increment badge
        else {
            setUnreadCounts((prev) => ({
                ...prev,
                [data.room]: (prev[data.room] || 0) + 1
            }));
        }
    });

    socket.on("load_history", (history) => setMessages(history));
    socket.on("display_typing", (data) => setTyping(`${data.user} is typing...`));
    socket.on("hide_typing", () => setTyping(""));

    return () => socket.off(); 
  }, [socket, activeRoom, username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // === HANDLERS ===
  const joinRoom = (roomToJoin) => {
    if(!roomToJoin) return;
    
    setActiveRoom(roomToJoin);
    setMobileView("chat"); 
    
    // === CLEAR UNREAD BADGE ===
    setUnreadCounts((prev) => ({ ...prev, [roomToJoin]: 0 }));

    socket.emit("join_room", { room: roomToJoin, username });
    setNewRoomInput("");
  };

  const leaveRoom = (e, roomToLeave) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to leave ${roomToLeave}?`)) {
        socket.emit("leave_room", { room: roomToLeave, username });
        if (activeRoom === roomToLeave) {
            setActiveRoom(null);
            setMobileView("list");
        }
    }
  };

  const sendMessage = async () => {
    if (!message || !activeRoom) return;
    const data = {
        room: activeRoom,
        author: username,
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    await socket.emit("send_message", data);
    setMessages((list) => [...list, data]);
    setMessage("");
    new Audio(sentSoundFile).play().catch(()=>{});
    socket.emit("stop_typing", activeRoom);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { room: activeRoom, user: username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("stop_typing", activeRoom), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-gray-100 overflow-hidden font-sans relative">
      
      {/* === LEFT SIDEBAR (MY ROOMS) === */}
      <div className={`${mobileView === "list" ? "flex" : "hidden"} md:flex w-full md:w-64 bg-black/30 border-r border-white/10 flex-col z-20`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white tracking-wide">SyncText</h2>
                <div className="text-xs text-gray-400 mt-1">Logged in as {username}</div>
            </div>
            <button onClick={logout} className="md:hidden text-red-400 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
            </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">My Rooms</h3>
            <div className="space-y-2">
                {myRooms.map((room) => (
                    <div 
                        key={room}
                        onClick={() => joinRoom(room)}
                        className={`group w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${activeRoom === room ? "bg-blue-600 shadow-lg shadow-blue-500/30" : "hover:bg-white/5 text-gray-400"}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-lg opacity-50">#</span>
                            <span className="font-medium truncate">{room}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* === RED BADGE (Shows only if count > 0) === */}
                            {unreadCounts[room] > 0 && (
                                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                                    {unreadCounts[room] > 99 ? "99+" : unreadCounts[room]}
                                </div>
                            )}

                            {/* LEAVE BUTTON */}
                            <button 
                                onClick={(e) => leaveRoom(e, room)}
                                className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-4 border-t border-white/10">
            <input 
                type="text" 
                placeholder="+ Join/Create Room" 
                className="w-full bg-black/40 text-sm p-3 rounded-lg outline-none border border-white/10 focus:border-blue-500 transition-all"
                value={newRoomInput}
                onChange={(e) => setNewRoomInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom(newRoomInput)}
            />
        </div>
      </div>

      {/* === MIDDLE (CHAT AREA) === */}
      <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col bg-[#0f172a] relative z-10`}>
        {activeRoom ? (
            <>
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-black/20 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileView("list")} className="md:hidden text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <span className="text-2xl text-gray-400">#</span>
                        <span className="text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">{activeRoom}</span>
                    </div>

                    <button onClick={() => setMobileView("members")} className="md:hidden text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => {
                        const isMe = msg.author === username;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`px-4 py-2 md:px-5 md:py-3 max-w-[85%] rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white/10 text-gray-200 rounded-bl-none"}`}>
                                    {msg.message}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">{msg.author} • {msg.time}</div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                <div className="p-3 md:p-4 bg-black/20 border-t border-white/10">
                    {typing && <div className="text-xs text-blue-400 mb-2 animate-pulse">{typing}</div>}
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 p-3 pl-4 pr-20 md:p-4 md:pl-6 md:pr-24 rounded-xl outline-none text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500 transition-all text-sm md:text-base"
                            placeholder="Message..."
                            value={message}
                            onChange={handleTyping}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        
                        <button onClick={() => setShowEmoji(!showEmoji)} className="absolute right-12 md:right-14 text-lg md:text-xl grayscale hover:grayscale-0 transition-all">😊</button>
                        
                        <button onClick={sendMessage} className="absolute right-2 md:right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>

                        {showEmoji && <div className="absolute bottom-16 right-0 z-50"><EmojiPicker theme="dark" width={300} height={400} onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} /></div>}
                    </div>
                </div>
            </>
        ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-white">Welcome, {username}!</h2>
                <p>Select a room from the sidebar.</p>
            </div>
        )}
      </div>

      {/* === RIGHT SIDEBAR (PROFILE & MEMBERS) === */}
      <div className={`${mobileView === "members" ? "flex fixed inset-0 z-50 bg-[#0f172a]" : "hidden"} md:flex w-full md:w-72 bg-black/20 border-l border-white/10 flex-col backdrop-blur-md`}>
         
         <div className="md:hidden p-4 border-b border-white/10 flex items-center gap-3">
             <button onClick={() => setMobileView("chat")} className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
             </button>
             <span className="font-bold text-white">Room Info</span>
         </div>

         <div className="p-6 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                    {username[0].toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-white">{username}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-green-400">Online</span>
                    </div>
                </div>
            </div>
            <button onClick={logout} className="w-full py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-sm text-gray-400 border border-white/5 rounded-lg transition-all">
                Log Out
            </button>
         </div>

         <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {activeRoom ? `Members - ${activeRoom}` : "Online Users"}
            </h3>
            
            <div className="space-y-1">
                {(activeRoom ? roomMembers : onlineGlobal).map((member, idx) => {
                    const isOnline = onlineGlobal.includes(member);
                    return (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isOnline ? "opacity-100" : "opacity-50 grayscale"}`}>
                             <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                                    {member[0]?.toUpperCase()}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#0f172a] rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}`}></div>
                             </div>
                             <div className="text-sm font-medium text-gray-300">
                                {member} {member === username && <span className="text-gray-500 text-xs">(You)</span>}
                             </div>
                        </div>
                    )
                })}
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;