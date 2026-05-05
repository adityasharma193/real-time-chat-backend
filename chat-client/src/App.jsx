import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/sidebar/Sidebar";
import Chat from "./components/chat/Chat";
import { getRooms } from "./services/api";
import { disconnectSocket } from "./services/socket";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  // ================= LOAD ROOMS =================
  const loadRooms = async () => {
    try {
      const data = await getRooms();

      const formatted = (data?.rooms || []).map((r) => ({
        id: r.id,
        name: r.name,
        unread_count: r.unread_count || 0,
      }));

      setRooms(formatted);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadRooms();
  }, [token]);

  // 🔥 reload when room changes (reset unread)
  useEffect(() => {
    if (!token || !activeRoom) return;
    loadRooms();
  }, [activeRoom]);

  // ================= AUTO SELECT ROOM =================
  useEffect(() => {
    if (rooms.length > 0 && !activeRoom) {
      setActiveRoom(rooms[0]);
    }
  }, [rooms, activeRoom]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    disconnectSocket();

    setToken(null);
    setRooms([]);
    setActiveRoom(null);
  };

  // ================= LOGIN =================
  if (!token) {
    return (
      <Login
        onSuccess={(newToken) => {
          localStorage.setItem("token", newToken);
          setToken(newToken);
        }}
      />
    );
  }

  // ================= MAIN APP =================
  return (
    <div className="h-screen flex bg-gray-900 text-white">

      {/* SIDEBAR */}
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
        onLogout={handleLogout}
      />

      {/* CHAT */}
      <Chat
        token={token}
        roomId={activeRoom?.id}
      />

    </div>
  );
}

export default App;