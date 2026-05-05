const pool = require("../config/db");

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const { cursor } = req.query;

    // Check membership
    const member = await pool.query(
      "SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2",
      [roomId, userId]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: "Not a room member" });
    }

    const query = cursor
      ? `
        SELECT 
          m.*,
          u.name,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'emoji', sub.emoji,
                  'count', sub.count
                )
              )
              FROM (
                SELECT emoji, COUNT(*) as count
                FROM reactions
                WHERE message_id = m.id
                GROUP BY emoji
              ) sub
            ),
            '[]'::json
          ) AS reactions
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.room_id = $1 AND m.id < $2
        ORDER BY m.id DESC
        LIMIT 20
      `
      : `
        SELECT 
          m.*,
          u.name,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'emoji', sub.emoji,
                  'count', sub.count
                )
              )
              FROM (
                SELECT emoji, COUNT(*) as count
                FROM reactions
                WHERE message_id = m.id
                GROUP BY emoji
              ) sub
            ),
            '[]'::json
          ) AS reactions
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.room_id = $1
        ORDER BY m.id DESC
        LIMIT 20
      `;

    const values = cursor ? [roomId, cursor] : [roomId];

    const result = await pool.query(query, values);

    res.json({
      messages: result.rows,
      nextCursor: result.rows.length
        ? result.rows[result.rows.length - 1].id
        : null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};