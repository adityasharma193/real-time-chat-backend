import React, {
  useState,
  useEffect,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Login from "./components/Login";

import Sidebar from "./components/sidebar/Sidebar";

import Chat from "./components/chat/Chat";

import { getRooms } from "./services/api";

import { disconnectSocket } from "./services/socket";

// ================= OAUTH SUCCESS PAGE =================
function OAuthSuccess({ setToken }) {

  const navigate = useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get("token");

    if (token) {

      localStorage.setItem(
        "token",
        token
      );

      setToken(token);

      navigate("/");
    }

  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      Logging in with Google...
    </div>
  );
}

// ================= MAIN CHAT APP =================
function MainApp() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [rooms, setRooms] = useState([]);

  const [activeRoom, setActiveRoom] =
    useState(null);

  // ================= LOAD ROOMS =================
  const loadRooms = async () => {

    try {

      const data =
        await getRooms();

      console.log(
        "APP DATA:",
        data
      );

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

    if (!token) return;

    loadRooms();

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
  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    disconnectSocket();

    setToken(null);

    setRooms([]);

    setActiveRoom(null);
  };

  // ================= LOGIN PAGE =================
  if (!token) {

    return (
      <Login
        onSuccess={(newToken) => {

          localStorage.setItem(
            "token",
            newToken
          );

          setToken(
            newToken
          );
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

// ================= ROOT APP =================
function App() {

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      )
    );

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<MainApp />}
        />

        <Route
          path="/oauth-success"
          element={
            <OAuthSuccess
              setToken={
                setToken
              }
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;