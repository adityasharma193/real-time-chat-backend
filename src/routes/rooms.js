const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../authMiddleware");

// ================= GET ROOMS WITH UNREAD =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT 
        r.id,
        r.name,

        COALESCE(COUNT(m.id), 0)::int AS unread_count

      FROM rooms r

      JOIN room_members rm 
        ON rm.room_id = r.id

      LEFT JOIN messages m 
        ON m.room_id = r.id
        AND m.created_at > rm.last_read_at

      WHERE rm.user_id = $1

      GROUP BY r.id, r.name
      ORDER BY r.id
    `, [userId]);

    res.json({ rooms: result.rows });

  } catch (err) {
    console.error("ROOMS ERROR:", err);
    res.status(500).json({ error: "Failed to load rooms" });
  }
});

module.exports = router;