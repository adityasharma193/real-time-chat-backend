const express = require("express");

const router = express.Router();

const pool = require("../config/db");

const authMiddleware =
  require("../authMiddleware");

// ================= GET USER ROOMS =================
router.get(
  "/",

  authMiddleware,

  async (req, res) => {

    try {

      const userId =
        req.user.userId;

      // ================= GET USER ROOMS =================
      const result =
        await pool.query(
          `
          SELECT
            rooms.id,
            rooms.name,

            COALESCE(
              COUNT(messages.id)
              FILTER (
                WHERE messages.created_at >
                room_members.last_read_at
              ),
              0
            ) AS unread_count

          FROM room_members

          JOIN rooms
          ON rooms.id = room_members.room_id

          LEFT JOIN messages
          ON messages.room_id = rooms.id

          WHERE room_members.user_id = $1

          GROUP BY
            rooms.id,
            rooms.name,
            room_members.last_read_at

          ORDER BY rooms.id ASC
          `,
          [userId]
        );

      res.json({
        success: true,
        rooms: result.rows,
      });

    } catch (err) {

      console.error(
        "GET ROOMS ERROR:",
        err
      );

      res.status(500).json({
        error:
          "Failed to load rooms",
      });
    }
  }
);

module.exports = router;