import { createHash } from "node:crypto";

type Entry = { hits: number; expiresAt: number };
const memory = new Map<string, Entry>();

export class RateLimitService {
  static hashIdentifier(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
  }

  static check(rawIdentifier: string, limit: number, windowMs: number) {
    const key = this.hashIdentifier(rawIdentifier);
    const now = Date.now();
    const current = memory.get(key);
    if (!current || current.expiresAt < now) {
      memory.set(key, { hits: 1, expiresAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }
    if (current.hits >= limit) return { allowed: false, remaining: 0 };
    current.hits += 1;
    memory.set(key, current);
    return { allowed: true, remaining: limit - current.hits };
  }
}
