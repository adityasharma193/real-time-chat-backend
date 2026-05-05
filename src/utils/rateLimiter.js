// Simple in-memory rate limiter per socket
// Good enough for Phase 2 (later we can move to Redis-based)

const messageLimits = new Map();

const WINDOW_MS = 5000; // 5 seconds
const MAX_MESSAGES = 20; // max messages per window

function isRateLimited(userId) {
  const now = Date.now();

  if (!messageLimits.has(userId)) {
    messageLimits.set(userId, []);
  }

  const timestamps = messageLimits.get(userId);

  // remove old timestamps
  const filtered = timestamps.filter(t => now - t < WINDOW_MS);

  filtered.push(now);
  messageLimits.set(userId, filtered);

  return filtered.length > MAX_MESSAGES;
}

module.exports = { isRateLimited };