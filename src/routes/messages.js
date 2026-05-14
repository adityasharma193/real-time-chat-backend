const express = require("express");

const router = express.Router();

const pool = require("../config/db");

const authMiddleware =
  require("../authMiddleware");

// ========================================
// GET MESSAGES
// ========================================
router.get(
  "/:roomId",

  authMiddleware,

  async (req, res) => {

    try {

      const userId =
        req.user.userId;

      const roomId =
        Number(req.params.roomId);

      // ================= VALIDATION =================
      if (
        !roomId ||
        Number.isNaN(roomId)
      ) {

        return res.status(400).json({
          error:
            "Invalid roomId",
        });
      }

      // ================= PAGINATION =================
      const cursor =
        req.query.cursor
          ? Number(
              req.query.cursor
            )
          : null;

      // ================= MEMBERSHIP CHECK =================
      const member =
        await pool.query(
          `
          SELECT 1
          FROM room_members
          WHERE room_id = $1
          AND user_id = $2
          `,
          [roomId, userId]
        );

      if (
        member.rows.length === 0
      ) {

        return res.status(403).json({
          error:
            "Not a room member",
        });
      }

      // ================= QUERY =================
      const query = `
        SELECT
          m.id,

          m.room_id AS "roomId",

          m.user_id AS "userId",

          u.name,

          m.text,

          m.status,

          m.created_at AS "createdAt",

          COALESCE(
            (
              SELECT json_agg(r)

              FROM (
                SELECT
                  emoji,
                  COUNT(*)::int AS count

                FROM reactions

                WHERE message_id = m.id

                GROUP BY emoji
              ) r
            ),
            '[]'
          ) AS reactions

        FROM messages m

        JOIN users u
        ON u.id = m.user_id

        WHERE m.room_id = $1

        ${
          cursor
            ? "AND m.id < $2"
            : ""
        }

        ORDER BY m.id DESC

        LIMIT 20
      `;

      const values =
        cursor
          ? [roomId, cursor]
          : [roomId];

      const result =
        await pool.query(
          query,
          values
        );

      res.json({
        success: true,

        messages:
          result.rows.reverse(),

        nextCursor:
          result.rows.length > 0
            ? result.rows[
                result.rows.length - 1
              ].id
            : null,
      });

    } catch (err) {

      console.error(
        "MESSAGES ERROR:",
        err
      );

      res.status(500).json({
        error:
          "Failed to fetch messages",
      });
    }
  }
);

module.exports = router;