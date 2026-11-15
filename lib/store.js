import { Redis } from "@upstash/redis";

// Works with either Vercel's Upstash integration (KV_REST_API_*) or Upstash's own env names.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "wordwall:words";
const TOTAL = "wordwall:total";

// Fallback for local dev only. On Vercel, serverless instances don't share memory,
// so connect Upstash Redis for real multi-user use.
const g = globalThis;
g.__wordwall ||= { words: new Map(), total: 0 };
const mem = g.__wordwall;

export const usingRedis = Boolean(redis);

export function normalize(raw) {
  if (typeof raw !== "string") return null;
  if (/\s/.test(raw.trim())) return null;
  const w = raw.trim().toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
  if (!w || w.length > 24) return null;
  return w;
}

export async function addWord(word) {
  if (redis) {
    await Promise.all([redis.zincrby(KEY, 1, word), redis.incr(TOTAL)]);
    return;
  }
  mem.words.set(word, (mem.words.get(word) || 0) + 1);
  mem.total += 1;
}

export async function getWords(limit = 80) {
  if (redis) {
    const [raw, total] = await Promise.all([
      redis.zrange(KEY, 0, limit - 1, { rev: true, withScores: true }),
      redis.get(TOTAL),
    ]);
    const words = [];
    for (let i = 0; i < raw.length; i += 2) words.push({ word: String(raw[i]), count: Number(raw[i + 1]) });
    return { words, total: Number(total || 0) };
  }
  const words = [...mem.words.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { words, total: mem.total };
}

export async function resetWords() {
  if (redis) {
    await redis.del(KEY, TOTAL);
    return;
  }
  mem.words.clear();
  mem.total = 0;
}
