const express = require("express");

const router = express.Router();

const pool = require("../config/db");

const authMiddleware =
  require("../authMiddleware");

// ================= GET ROOM MESSAGES =================
router.get(
  "/:roomId",
  authMiddleware,

  async (req, res) => {

    try {

      const roomId =
        Number(req.params.roomId);

      const result = await pool.query(
        `
        SELECT
          m.id,
          m.room_id AS "roomId",
          m.user_id AS "userId",
          u.name,
          m.text,
          m.status,
          m.created_at AS "createdAt"

        FROM messages m

        JOIN users u
        ON u.id = m.user_id

        WHERE m.room_id = $1

        ORDER BY m.created_at ASC
        `,
        [roomId]
      );

      res.json({
        messages: result.rows,
      });

    } catch (err) {

      console.error(
        "GET MESSAGE ERROR:",
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