import {
  useEffect,
  useState,
} from "react";

import {
  getSocket,
} from "../../services/socket";

export default function Sidebar({
  rooms,
  activeRoom,
  setActiveRoom,
  onLogout,
}) {

  const [onlineCount, setOnlineCount] =
    useState(0);

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  // ================= ONLINE USERS =================
  useEffect(() => {

    const socket =
      getSocket();

    if (!socket) return;

    socket.on(
      "online-users",
      (count) => {

        setOnlineCount(count);
      }
    );

    return () => {

      socket.off(
        "online-users"
      );
    };

  }, []);

  return (

    <div className="w-[300px] bg-[#0f172a] border-r border-slate-800 flex flex-col">

      {/* HEADER */}
      <div className="h-20 border-b border-slate-800 flex items-center justify-between px-5">

        <div>

          <h1 className="text-2xl font-black text-white">
            Chat App
          </h1>

          <p className="text-sm text-slate-400">
            Real-time messaging
          </p>

        </div>

        <div className="text-green-400 text-sm font-semibold">
          {onlineCount} online
        </div>

      </div>

      {/* ROOMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {rooms.map((room) => (

          <button
            key={room.id}

            onClick={() =>
              setActiveRoom(room)
            }

            className={`
              w-full
              text-left
              px-4
              py-4
              rounded-2xl
              transition
              border

              ${
                activeRoom?.id === room.id
                  ? `
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-700
                    border-blue-500
                    shadow-lg
                  `
                  : `
                    bg-slate-800/60
                    border-slate-700
                    hover:border-blue-500
                    hover:bg-slate-800
                  `
              }
            `}
          >

            <div className="flex items-center justify-between">

              <span className="font-semibold text-white">
                # {room.name}
              </span>

              {room.unread_count > 0 && (

                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {room.unread_count}
                </span>
              )}

            </div>

          </button>
        ))}

      </div>

      {/* USER */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-bold text-lg">

            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}

          </div>

          <div>

            <div className="font-semibold text-white">
              {user?.name}
            </div>

            <div className="text-sm text-slate-400">
              Active now
            </div>

          </div>

        </div>

        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-white font-semibold transition"
        >
          Logout
        </button>

      </div>

    </div>
  );
}