import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "wordwall:postcards";
export const LIMITS = { moment: 300, lesson: 160, next: 200 };

const g = globalThis;
g.__postcards ||= [];
const mem = g.__postcards;

export const usingRedis = Boolean(redis);

const clean = (v, max) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export function validate(body) {
  const card = {
    moment: clean(body?.moment, LIMITS.moment),
    lesson: clean(body?.lesson, LIMITS.lesson),
    choice: body?.choice === "change" ? "change" : "keep",
    next: clean(body?.next, LIMITS.next),
  };
  if (!card.moment || !card.lesson || !card.next) return null;
  return card;
}

export async function addPostcard(card) {
  const entry = { id: crypto.randomUUID(), at: Date.now(), ...card };
  if (redis) {
    await redis.lpush(KEY, JSON.stringify(entry));
    await redis.ltrim(KEY, 0, 999);
  } else {
    mem.unshift(entry);
    mem.length = Math.min(mem.length, 1000);
  }
  return entry;
}

export async function getPostcards() {
  if (redis) {
    const raw = await redis.lrange(KEY, 0, -1);
    return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
  }
  return [...mem];
}

export async function clearPostcards() {
  if (redis) await redis.del(KEY);
  else mem.length = 0;
}
