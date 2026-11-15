import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "wordwall:lessons";
export const LESSON_MAX = 200;

const g = globalThis;
g.__lessons ||= [];
const mem = g.__lessons;

export const usingRedis = Boolean(redis);

export function validate(body) {
  const lesson = typeof body?.lesson === "string" ? body.lesson.trim().replace(/\s+/g, " ").slice(0, LESSON_MAX) : "";
  return lesson || null;
}

export async function addLesson(lesson) {
  const entry = { id: crypto.randomUUID(), at: Date.now(), lesson };
  if (redis) {
    await redis.lpush(KEY, JSON.stringify(entry));
    await redis.ltrim(KEY, 0, 999);
  } else {
    mem.unshift(entry);
    mem.length = Math.min(mem.length, 1000);
  }
  return entry;
}

export async function getLessons() {
  if (redis) {
    const raw = await redis.lrange(KEY, 0, -1);
    return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
  }
  return [...mem];
}

export async function clearLessons() {
  if (redis) await redis.del(KEY);
  else mem.length = 0;
}
