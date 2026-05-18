require("dotenv").config();

const http = require("http");

const { Server } =
  require("socket.io");

const app = require("./app");

const pool =
  require("./config/db");

const jwt =
  require("jsonwebtoken");

const server =
  http.createServer(app);

// ================= SOCKET SERVER =================
const io =
  new Server(server, {

    cors: {

      origin: [
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ],

      methods: [
        "GET",
        "POST",
      ],

      credentials: true,
    },
  });

// ================= SOCKET AUTH =================
io.use((socket, next) => {

  try {

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
});

// ================= SOCKET EVENTS =================
io.on(
  "connection",

  (socket) => {

    console.log(
      "SOCKET CONNECTED:",
      socket.id
    );

    console.log(
      "USER:",
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

          if (
            !text?.trim()
          ) {

            return;
          }

          // save message
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
                text.trim(),
              ]
            );

          const message =
            result.rows[0];

          // get username
          const user =
            await pool.query(
              `
              SELECT name
              FROM users
              WHERE id = $1
              `,
              [
                socket.user.userId,
              ]
            );

          // realtime emit
          io.to(
            String(roomId)
          ).emit(
            "new-message",
            {

              id:
                message.id,

              roomId:
                message.room_id,

              userId:
                message.user_id,

              text:
                message.text,

              status:
                message.status,

              createdAt:
                message.created_at,

              name:
                user.rows[0]
                  ?.name
                || "User",

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

    // ================= REACTION =================
    socket.on(
      "add-reaction",

      async ({
        messageId,
        emoji,
        roomId,
      }) => {

        try {

          // check existing
          const existing =
            await pool.query(
              `
              SELECT *
              FROM reactions

              WHERE message_id = $1
              AND user_id = $2
              AND emoji = $3
              `,
              [
                messageId,
                socket.user.userId,
                emoji,
              ]
            );

          // toggle reaction
          if (
            existing.rows
              .length > 0
          ) {

            await pool.query(
              `
              DELETE FROM reactions

              WHERE message_id = $1
              AND user_id = $2
              AND emoji = $3
              `,
              [
                messageId,
                socket.user.userId,
                emoji,
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
                socket.user.userId,
                emoji,
              ]
            );
          }

          // updated reactions
          const result =
            await pool.query(
              `
              SELECT
                emoji,
                COUNT(*)::int AS count

              FROM reactions

              WHERE message_id = $1

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
                result.rows,
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
  }
);

// ================= START SERVER =================
const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,

  () => {

    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);