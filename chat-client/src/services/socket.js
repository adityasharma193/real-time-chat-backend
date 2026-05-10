import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL
    ?.replace("/api", "") ||
  "http://localhost:5000";

let socket;

export const connectSocket = (token) => {

  if (!socket) {

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};