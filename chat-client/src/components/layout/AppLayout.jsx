import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import Chat from "../chat/Chat";

export default function AppLayout({ rooms }) {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <Sidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
      />

      <Chat activeRoom={activeRoom} />
    </div>
  );
}