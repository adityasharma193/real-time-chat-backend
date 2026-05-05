import { io } from "socket.io-client";

let socket = null;

// ================= CONNECT =================
export const connectSocket = (token) => {
  // 🔥 prevent duplicate connections
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ socket error:", err.message);
  });

  return socket;
};

// ================= GET =================
export const getSocket = () => socket;

// ================= DISCONNECT =================
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 socket manually disconnected");
  }
};