import io from "socket.io-client";
import { useState, useEffect } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

const socket = io.connect("http://localhost:3001");

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("chat_username");
    if (savedUser) {
      setUsername(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem("chat_username", user);
  };

  const handleLogout = () => {
    socket.emit("user_logout");
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("chat_username");
  };

  return (
    <>
      {!isLoggedIn ? (
        <Auth 
          username={username} 
          setUsername={setUsername} 
          onLoginSuccess={handleLoginSuccess} 
        />
      ) : (
        <Dashboard 
          socket={socket} 
          username={username} 
          logout={handleLogout} 
        />
      )}
    </>
  );
}

export default App;