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

// ================= CHAT APP =================
function ChatApp({
  token,
  setToken,
}) {

  const [rooms, setRooms] =
    useState([]);

  const [activeRoom, setActiveRoom] =
    useState(null);

  // ================= LOAD ROOMS =================
  const loadRooms =
    async () => {

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

        setRooms(
          formatted
        );

      } catch (err) {

        console.error(
          "Failed to load rooms:",
          err
        );
      }
    };

  // ================= INITIAL LOAD =================
  useEffect(() => {

    if (token) {

      loadRooms();
    }

  }, [token]);

  // ================= AUTO SELECT ROOM =================
  useEffect(() => {

    if (
      rooms.length > 0 &&
      !activeRoom
    ) {

      setActiveRoom(
        rooms[0]
      );
    }

  }, [rooms, activeRoom]);

  // ================= LOGOUT =================
  const handleLogout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      disconnectSocket();

      setToken(null);
    };

  return (

    <div className="h-screen flex bg-[#020617] text-white overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar
        rooms={rooms}
        activeRoom={
          activeRoom
        }
        setActiveRoom={
          setActiveRoom
        }
        onLogout={
          handleLogout
        }
      />

      {/* CHAT */}
      <Chat
        token={token}
        roomId={
          activeRoom?.id
        }
      />

    </div>
  );
}

// ================= MAIN APP =================
export default function App() {

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      )
    );

  return (

    <Routes>

      {/* GOOGLE SUCCESS */}
      <Route
        path="/oauth-success"
        element={
          <OAuthSuccess />
        }
      />

      {/* MAIN */}
      <Route
        path="/"
        element={

          token ? (

            <ChatApp
              token={token}
              setToken={
                setToken
              }
            />

          ) : (

            <Login
              onSuccess={(
                newToken
              ) => {

                localStorage.setItem(
                  "token",
                  newToken
                );

                setToken(
                  newToken
                );
              }}
            />
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