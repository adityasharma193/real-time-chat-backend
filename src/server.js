require("dotenv").config();

const http = require("http");

const { Server } =
  require("socket.io");

const app = require("./app");

const pool =
  require("./config/db");

const jwt = require("jsonwebtoken");

const server =
  http.createServer(app);

// ================= SOCKET =================
const io = new Server(server, {

  cors: {

    origin: "*",

    methods: ["GET", "POST"],
  },
});

// ================= SOCKET AUTH =================
io.use((socket, next) => {

  try {

    const token =
      socket.handshake.auth.token;

    if (!token) {
      return next(
        new Error("No token")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();

  } catch (err) {

    next(new Error("Invalid token"));
  }
});

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {

  console.log(
    "USER CONNECTED:",
    socket.user.email
  );

  // ================= JOIN ROOM =================
  socket.on(
    "join-room",
    (roomId) => {

      socket.join(
        String(roomId)
      );

      console.log(
        "JOINED ROOM:",
        roomId
      );
    }
  );

  // ================= SEND MESSAGE =================
  socket.on(
    "send-message",

    async ({
      roomId,
      text,
    }) => {

      try {

        const result =
          await pool.query(
            `
            INSERT INTO messages
            (
              room_id,
              user_id,
              text,
              status
            )

            VALUES
            (
              $1,
              $2,
              $3,
              'sent'
            )

            RETURNING *
            `,
            [
              roomId,
              socket.user.userId,
              text,
            ]
          );

        const message =
          result.rows[0];

        const user =
          await pool.query(
            `
            SELECT name
            FROM users
            WHERE id = $1
            `,
            [socket.user.userId]
          );

        io.to(
          String(roomId)
        ).emit(
          "new-message",
          {
            ...message,

            roomId:
              message.room_id,

            userId:
              message.user_id,

            createdAt:
              message.created_at,

            name:
              user.rows[0].name,

            reactions: [],
          }
        );

      } catch (err) {

        console.error(
          "SEND MESSAGE ERROR:",
          err
        );
      }
    }
  );

  // ================= TYPING =================
  socket.on(
    "typing",
    (roomId) => {

      socket.to(
        String(roomId)
      ).emit(
        "user-typing",
        {
          userId:
            socket.user.userId,
        }
      );
    }
  );

  socket.on(
    "stop-typing",
    (roomId) => {

      socket.to(
        String(roomId)
      ).emit(
        "user-stop-typing",
        {
          userId:
            socket.user.userId,
        }
      );
    }
  );

  // ================= DISCONNECT =================
  socket.on(
    "disconnect",
    () => {

      console.log(
        "USER DISCONNECTED"
      );
    }
  );
});

// ================= START =================
const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );
});