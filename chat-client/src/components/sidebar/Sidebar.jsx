import { useEffect, useMemo, useState } from "react";
import { getSocket } from "../../services/socket";

export default function Sidebar({
  rooms = [],
  activeRoom,
  setActiveRoom,
  unread = {},          // 🔥 from App.jsx
  onLogout,
}) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ================= USER =================
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // ================= SOCKET (ONLINE USERS) =================
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnlineList = (list) => setOnlineUsers(list);

    const handleUserOnline = (userId) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    socket.on("online-users", handleOnlineList);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.off("online-users", handleOnlineList);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, []);

  return (
    <div className="w-64 bg-gray-800 flex flex-col border-r border-gray-700">

      {/* HEADER */}
      <div className="h-14 flex items-center justify-between px-4 font-semibold border-b border-gray-700">
        <span>Chat App</span>

        {/* 🔥 ONLINE COUNT */}
        <span className="text-xs text-green-400">
          {onlineUsers.length} online
        </span>
      </div>

      {/* ROOMS */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rooms.length === 0 && (
          <div className="text-gray-400 text-sm text-center mt-4">
            No rooms found
          </div>
        )}

        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setActiveRoom(room)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
              activeRoom?.id === room.id
                ? "bg-gray-700"
                : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-sm"># {room.name}</span>

            {/* 🔥 UNREAD BADGE (FRONTEND STATE) */}
            {unread?.[room.id] > 0 && (
              <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                {unread[room.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* USER + LOGOUT */}
      <div className="h-16 border-t border-gray-700 flex items-center justify-between px-4">

        {/* USER INFO */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* 🔥 ONLINE DOT */}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
          </div>

          <div className="text-sm">
            {user?.name || "User"}
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}