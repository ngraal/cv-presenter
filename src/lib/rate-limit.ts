const WINDOW_MS = 1000;
const MAX_REQUESTS = 30;

interface WindowEntry {
  timestamps: number[];
}

const ipWindows = new Map<string, WindowEntry>();

// Cleanup stale entries every 60 seconds
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - WINDOW_MS;
  for (const [ip, entry] of ipWindows) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      ipWindows.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  cleanup(now);

  const cutoff = now - WINDOW_MS;
  let entry = ipWindows.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    ipWindows.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1) };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}
