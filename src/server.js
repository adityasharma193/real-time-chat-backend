require("dotenv").config();
require("./config/db");

const http = require("http");
const app = require("./app");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("./config/db");
const { isRateLimited } = require("./utils/rateLimiter");

// ================= SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {

      // allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      // localhost
      if (origin === "http://localhost:3000") {
        return callback(null, true);
      }

      // allow all vercel deployments
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================= ONLINE USERS =================
const onlineUsers = new Map();

// ================= AUTH =================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("No token"));
  }

  try {
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

// ================= SOCKET CONNECTION =================
io.on("connection", (socket) => {

  const userId = socket.user.userId;

  console.log("✅ User connected:", userId);

  // save online user
  onlineUsers.set(userId, socket.id);

  // personal room
  socket.join(`user-${userId}`);

  // send online list
  socket.emit(
    "online-users",
    Array.from(onlineUsers.keys())
  );

  // notify others
  socket.broadcast.emit(
    "user-online",
    userId
  );

  // joined rooms tracker
  socket.joinedRooms = new Set();

  // ================= JOIN ROOM =================
  socket.on("join-room", async (roomId) => {

    try {

      socket.join(roomId);

      socket.joinedRooms.add(roomId);

      // create/update room member
      await pool.query(
        `INSERT INTO room_members
        (room_id, user_id, last_read_at)

        VALUES ($1, $2, NOW())

        ON CONFLICT (room_id, user_id)

        DO UPDATE SET
        last_read_at = NOW()`,
        [roomId, userId]
      );

      console.log(
        `User ${userId} joined room ${roomId}`
      );

    } catch (err) {

      console.error("Join error:", err);
    }
  });

  // ================= SEND MESSAGE =================
  socket.on(
    "send-message",
    async ({ roomId, text }) => {

      try {

        if (!roomId || !text?.trim()) {
          return;
        }

        // rate limit
        if (isRateLimited(userId)) {

          return socket.emit(
            "error",
            "Too fast"
          );
        }

        // must join room first
        if (!socket.joinedRooms.has(roomId)) {

          return socket.emit(
            "error",
            "Join room first"
          );
        }

        // save message
        const result = await pool.query(
          `INSERT INTO messages
          (room_id, user_id, text, status, created_at)

          VALUES
          ($1, $2, $3, 'sent', NOW())

          RETURNING
            id,
            room_id AS "roomId",
            user_id AS "userId",
            text,
            status,
            created_at AS "createdAt"`,
          [roomId, userId, text.trim()]
        );

        const message = result.rows[0];

        // get username
        const user = await pool.query(
          "SELECT name FROM users WHERE id=$1",
          [userId]
        );

        message.name =
          user.rows[0]?.name || "User";

        message.reactions = [];

        // realtime emit
        io.to(roomId).emit(
          "new-message",
          message
        );

      } catch (err) {

        console.error("Send error:", err);
      }
    }
  );

  // ================= MARK SEEN =================
  socket.on(
    "mark-seen",
    async (roomId) => {

      try {

        await pool.query(
          `UPDATE messages

          SET status='seen'

          WHERE room_id=$1
          AND user_id != $2
          AND status != 'seen'`,
          [roomId, userId]
        );

        socket.to(roomId).emit(
          "messages-seen",
          {
            roomId,
            userId,
          }
        );

      } catch (err) {

        console.error("Seen error:", err);
      }
    }
  );

  // ================= REACTIONS =================
  socket.on(
    "add-reaction",
    async ({ messageId, emoji, roomId }) => {

      try {

        if (!socket.joinedRooms.has(roomId)) {
          return;
        }

        // check existing
        const existing = await pool.query(
          `SELECT *
          FROM reactions
          WHERE message_id=$1
          AND user_id=$2`,
          [messageId, userId]
        );

        // toggle reaction
        if (existing.rows.length > 0) {

          await pool.query(
            `DELETE FROM reactions
            WHERE message_id=$1
            AND user_id=$2`,
            [messageId, userId]
          );

        } else {

          await pool.query(
            `INSERT INTO reactions
            (message_id, user_id, emoji)

            VALUES ($1, $2, $3)`,
            [messageId, userId, emoji]
          );
        }

        // updated reactions
        const reactions = await pool.query(
          `SELECT
            emoji,
            COUNT(*)::int AS count

          FROM reactions

          WHERE message_id=$1

          GROUP BY emoji`,
          [messageId]
        );

        io.to(roomId).emit(
          "reaction-update",
          {
            messageId,
            reactions: reactions.rows || [],
          }
        );

      } catch (err) {

        console.error("Reaction error:", err);
      }
    }
  );

  // ================= TYPING =================
  socket.on("typing", (roomId) => {

    socket.to(roomId).emit(
      "user-typing",
      {
        userId,
      }
    );
  });

  socket.on("stop-typing", (roomId) => {

    socket.to(roomId).emit(
      "user-stop-typing",
      {
        userId,
      }
    );
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {

    console.log(
      "❌ User disconnected:",
      userId
    );

    onlineUsers.delete(userId);

    io.emit(
      "user-offline",
      userId
    );
  });
});

// ================= ERROR HANDLING =================
process.on("uncaughtException", (err) => {

  console.error(
    "UNCAUGHT ERROR:",
    err
  );
});

process.on("unhandledRejection", (err) => {

  console.error(
    "UNHANDLED REJECTION:",
    err
  );
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );
});