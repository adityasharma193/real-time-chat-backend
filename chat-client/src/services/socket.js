import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL
    ?.replace("/api", "") ||
  "http://localhost:5000";

let socket = null;

// ================= CONNECT =================
export const connectSocket = (token) => {

  if (socket) return socket;

  socket = io(SOCKET_URL, {

    auth: {
      token,
    },

    transports: ["websocket"],

    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log(
      "SOCKET CONNECTED:",
      socket.id
    );
  });

  socket.on(
    "disconnect",
    () => {
      console.log(
        "SOCKET DISCONNECTED"
      );
    }
  );

  socket.on(
    "connect_error",
    (err) => {
      console.error(
        "SOCKET ERROR:",
        err.message
      );
    }
  );

  return socket;
};

// ================= GET SOCKET =================
export const getSocket = () => {
  return socket;
};

// ================= DISCONNECT =================
export const disconnectSocket = () => {

  if (socket) {

    socket.disconnect();

    socket = null;
  }
};