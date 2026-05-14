import React, {
  useState,
  useEffect,
} from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Sidebar from "./components/sidebar/Sidebar";
import Chat from "./components/chat/Chat";
import OAuthSuccess from "./pages/OAuthSuccess";

import {
  getRooms,
} from "./services/api";

import {
  disconnectSocket,
} from "./services/socket";

function ChatApp() {

  const [rooms, setRooms] =
    useState([]);

  const [activeRoom, setActiveRoom] =
    useState(null);

  // ================= LOAD ROOMS =================
  const loadRooms = async () => {

    try {

      const data =
        await getRooms();

      const formatted =
        (data.rooms || []).map(
          (r) => ({
            id: r.id,
            name: r.name,
            unread_count:
              r.unread_count || 0,
          })
        );

      setRooms(formatted);

    } catch (err) {

      console.error(
        "Failed to load rooms:",
        err
      );
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {

    loadRooms();

  }, []);

  // ================= AUTO SELECT =================
  useEffect(() => {

    if (
      rooms.length > 0 &&
      !activeRoom
    ) {

      setActiveRoom(rooms[0]);
    }

  }, [rooms, activeRoom]);

  // ================= LOGOUT =================
  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    disconnectSocket();

    window.location.href = "/";
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white">

      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={
          setActiveRoom
        }
        onLogout={
          handleLogout
        }
      />

      <Chat
        roomId={
          activeRoom?.id
        }
      />

    </div>
  );
}

export default function App() {

  const token =
    localStorage.getItem(
      "token"
    );

  return (

    <Routes>

      {/* GOOGLE SUCCESS */}
      <Route
        path="/oauth-success"
        element={<OAuthSuccess />}
      />

      {/* MAIN APP */}
      <Route
        path="/"
        element={
          token
            ? <ChatApp />
            : (
              <Login />
            )
        }
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate to="/" />
        }
      />

    </Routes>
  );
}