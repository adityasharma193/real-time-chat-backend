require("dotenv").config();

require("./config/db");

const http = require("http");

const app = require("./app");

const socketIo = require("socket.io");

const jwt = require("jsonwebtoken");

const pool = require("./config/db");

const {
  isRateLimited,
} = require("./utils/rateLimiter");

// ================= SERVER =================
const server =
  http.createServer(app);

// ================= SOCKET.IO =================
const io = socketIo(
  server,
  {
    cors: {
      origin: (
        origin,
        callback
      ) => {

        if (!origin) {
          return callback(
            null,
            true
          );
        }

        if (
          origin ===
          "http://localhost:3000"
        ) {

          return callback(
            null,
            true
          );
        }

        if (
          origin.includes(
            "vercel.app"
          )
        ) {

          return callback(
            null,
            true
          );
        }

        return callback(
          new Error(
            "Not allowed by CORS"
          )
        );
      },

      methods: [
        "GET",
        "POST",
      ],

      credentials: true,
    },
  }
);

// ================= ONLINE USERS =================
const onlineUsers =
  new Map();

// ================= AUTH =================
io.use(
  (socket, next) => {

    const token =
      socket.handshake.auth
        ?.token;

    if (!token) {

      return next(
        new Error(
          "No token"
        )
      );
    }

    try {

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      socket.user =
        decoded;

      next();

    } catch (err) {

      next(
        new Error(
          "Invalid token"
        )
      );
    }
  }
);

// ================= CONNECTION =================
io.on(
  "connection",

  (socket) => {

    const userId =
      socket.user.userId;

    console.log(
      "✅ User connected:",
      userId
    );

    // ================= ONLINE =================
    onlineUsers.set(
      userId,
      socket.id
    );

    socket.join(
      `user-${userId}`
    );

    socket.emit(
      "online-users",

      Array.from(
        onlineUsers.keys()
      )
    );

    socket.broadcast.emit(
      "user-online",
      userId
    );

    // ================= JOINED ROOMS =================
    socket.joinedRooms =
      new Set();

    // ================= JOIN ROOM =================
    socket.on(
      "join-room",

      async (roomId) => {

        try {

          roomId =
            Number(roomId);

          socket.join(
            String(roomId)
          );

          socket.joinedRooms.add(
            roomId
          );

          await pool.query(
            `
            INSERT INTO room_members
            (
              room_id,
              user_id,
              last_read_at
            )

            VALUES
            (
              $1,
              $2,
              NOW()
            )

            ON CONFLICT
            (
              room_id,
              user_id
            )

            DO UPDATE SET
            last_read_at = NOW()
            `,
            [
              roomId,
              userId,
            ]
          );

          console.log(
            `User ${userId} joined room ${roomId}`
          );

        } catch (err) {

          console.error(
            "JOIN ERROR:",
            err
          );
        }
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

          roomId =
            Number(roomId);

          if (
            !roomId ||
            !text?.trim()
          ) {

            return;
          }

          // ================= RATE LIMIT =================
          if (
            isRateLimited(
              userId
            )
          ) {

            return socket.emit(
              "error",
              "Too fast"
            );
          }

          // ================= ROOM CHECK =================
          if (
            !socket.joinedRooms.has(
              roomId
            )
          ) {

            return socket.emit(
              "error",
              "Join room first"
            );
          }

          // ================= SAVE MESSAGE =================
          const result =
            await pool.query(
              `
              INSERT INTO messages
              (
                room_id,
                user_id,
                text,
                status,
                created_at
              )

              VALUES
              (
                $1,
                $2,
                $3,
                'sent',
                NOW()
              )

              RETURNING
                id,
                room_id AS "roomId",
                user_id AS "userId",
                text,
                status,
                created_at AS "createdAt"
              `,
              [
                roomId,
                userId,
                text.trim(),
              ]
            );

          const message =
            result.rows[0];

          // ================= USER NAME =================
          const user =
            await pool.query(
              `
              SELECT name
              FROM users
              WHERE id = $1
              `,
              [userId]
            );

          message.name =
            user.rows[0]?.name
            || "User";

          message.reactions =
            [];

          // ================= REALTIME =================
          io.to(
            String(roomId)
          ).emit(
            "new-message",
            message
          );

        } catch (err) {

          console.error(
            "SEND ERROR:",
            err
          );
        }
      }
    );

    // ================= REACTIONS =================
    socket.on(
      "add-reaction",

      async ({
        messageId,
        emoji,
        roomId,
      }) => {

        try {

          roomId =
            Number(roomId);

          if (
            !socket.joinedRooms.has(
              roomId
            )
          ) {

            return;
          }

          const existing =
            await pool.query(
              `
              SELECT *
              FROM reactions
              WHERE message_id=$1
              AND user_id=$2
              `,
              [
                messageId,
                userId,
              ]
            );

          if (
            existing.rows
              .length > 0
          ) {

            await pool.query(
              `
              DELETE FROM reactions
              WHERE message_id=$1
              AND user_id=$2
              `,
              [
                messageId,
                userId,
              ]
            );

          } else {

            await pool.query(
              `
              INSERT INTO reactions
              (
                message_id,
                user_id,
                emoji
              )

              VALUES
              (
                $1,
                $2,
                $3
              )
              `,
              [
                messageId,
                userId,
                emoji,
              ]
            );
          }

          const reactions =
            await pool.query(
              `
              SELECT
                emoji,
                COUNT(*)::int AS count

              FROM reactions

              WHERE message_id=$1

              GROUP BY emoji
              `,
              [messageId]
            );

          io.to(
            String(roomId)
          ).emit(
            "reaction-update",
            {
              messageId,

              reactions:
                reactions.rows
                || [],
            }
          );

        } catch (err) {

          console.error(
            "REACTION ERROR:",
            err
          );
        }
      }
    );

    // ================= DISCONNECT =================
    socket.on(
      "disconnect",

      () => {

        console.log(
          "❌ User disconnected:",
          userId
        );

        onlineUsers.delete(
          userId
        );

        io.emit(
          "user-offline",
          userId
        );
      }
    );
  }
);

// ================= START =================
const PORT =
  process.env.PORT
  || 5000;

server.listen(
  PORT,

  () => {

    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);