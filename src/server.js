require("dotenv").config();
require("./config/db");

const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("./config/db");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { isRateLimited } = require("./utils/rateLimiter");

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// ================= ONLINE USERS (ONLY ONCE) =================
const onlineUsers = new Map();

// ================= REDIS =================
const pubClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

const subClient = pubClient.duplicate();

(async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis error:", err);
  }
})();

// ================= AUTH =================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// ================= SOCKET =================
io.on("connection", (socket) => {
  const userId = socket.user.userId;

  console.log("✅ User connected:", userId);

  // store user
  onlineUsers.set(userId, socket.id);

  // join personal room
  socket.join(`user-${userId}`);

  // send online users list
  socket.emit("online-users", Array.from(onlineUsers.keys()));
  socket.broadcast.emit("user-online", userId);

  // track joined rooms
  socket.joinedRooms = new Set();

  // ================= JOIN ROOM =================
  socket.on("join-room", async (roomId) => {
  try {
    // join socket room
    socket.join(roomId);

    // track joined rooms
    socket.joinedRooms.add(roomId);

    // 🔥 THIS IS THE IMPORTANT PART
    await pool.query(
      `INSERT INTO room_members (room_id, user_id, last_read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (room_id, user_id)
       DO UPDATE SET last_read_at = NOW()`,
      [roomId, userId]
    );

    console.log(`User ${userId} joined room ${roomId}`);

  } catch (err) {
    console.error("Join error:", err);
  }
});

  // ================= SEND MESSAGE =================
  socket.on("send-message", async ({ roomId, text }) => {
    try {
      if (!roomId || !text?.trim()) return;

      if (isRateLimited(userId)) {
        return socket.emit("error", "Too fast");
      }

      if (!socket.joinedRooms.has(roomId)) {
        return socket.emit("error", "Join room first");
      }

      const result = await pool.query(
        `INSERT INTO messages (room_id, user_id, text, status, created_at)
         VALUES ($1,$2,$3,'sent', NOW())
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

      const user = await pool.query(
        "SELECT name FROM users WHERE id=$1",
        [userId]
      );

      message.name = user.rows[0]?.name || "User";
      message.reactions = [];

      io.to(roomId).emit("new-message", message);

    } catch (err) {
      console.error("Send error:", err);
    }
  });

  // ================= MARK SEEN =================
socket.on("mark-seen", async (roomId) => {
  try {
    const userId = socket.user.userId;

    // update all unseen messages in that room
    await pool.query(
      `UPDATE messages
       SET status = 'seen'
       WHERE room_id = $1
       AND user_id != $2
       AND status != 'seen'`,
      [roomId, userId]
    );

    // notify others in room
    socket.to(roomId).emit("messages-seen", {
      roomId,
      userId
    });

  } catch (err) {
    console.error("Seen error:", err);
  }
});
  // ================= REACTIONS =================
  socket.on("add-reaction", async ({ messageId, emoji, roomId }) => {
    try {
      if (!socket.joinedRooms.has(roomId)) return;

      const existing = await pool.query(
        `SELECT * FROM reactions 
         WHERE message_id=$1 AND user_id=$2`,
        [messageId, userId]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `DELETE FROM reactions 
           WHERE message_id=$1 AND user_id=$2`,
          [messageId, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO reactions (message_id,user_id,emoji)
           VALUES ($1,$2,$3)`,
          [messageId, userId, emoji]
        );
      }

      const reactions = await pool.query(
        `SELECT emoji, COUNT(*)::int AS count
         FROM reactions
         WHERE message_id=$1
         GROUP BY emoji`,
        [messageId]
      );

      io.to(roomId).emit("reaction-update", {
        messageId,
        reactions: reactions.rows || []
      });

    } catch (err) {
      console.error("Reaction error:", err);
    }
  });

  // ================= TYPING =================
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("user-typing", {
      userId
    });
  });

  socket.on("stop-typing", (roomId) => {
    socket.to(roomId).emit("user-stop-typing", {
      userId
    });
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);

    onlineUsers.delete(userId);
    io.emit("user-offline", userId);
  });
});

// ================= ERROR SAFETY =================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED:", err);
});

// ================= START =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});