const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRpdHlhQGdtYWlsLmNvbSIsImlhdCI6MTc3MDE0NjM4NiwiZXhwIjoxNzcwMTQ5OTg2fQ.m0Q7VyRqnUxxlQ-0sd3yGNx86AHNka6BbLroSxJM4dQ"
  }
});

const ROOM_ID = 1;   // 👈 USE THE ROOM YOU ACTUALLY CREATED

socket.on("connect", () => {
  console.log("Connected to socket");

  socket.emit("join-room", ROOM_ID);

  socket.emit("send-message", {
    roomId: ROOM_ID,
    text: "Hello from socket test"
  });
});

socket.on("joined", (roomId) => {
  console.log("Joined room:", roomId);
});

socket.on("new-message", (msg) => {
  console.log("NEW MESSAGE RECEIVED:", msg);
});

socket.on("error", (err) => {
  console.log("SOCKET ERROR:", err);
});
