import { NextResponse } from "next/server";
import { addLesson, clearLessons, getLessons, usingRedis, validate } from "@/lib/lessons";

export const dynamic = "force-dynamic";

export async function GET() {
  const lessons = await getLessons();
  return NextResponse.json({ lessons, persistent: usingRedis }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const lesson = validate(body);
  if (!lesson) return NextResponse.json({ error: "Write your lesson before sending." }, { status: 400 });
  await addLesson(lesson);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const key = process.env.ADMIN_KEY;
  const { key: given } = await req.json().catch(() => ({}));
  if (!key) return NextResponse.json({ error: "Set ADMIN_KEY in Vercel to enable clearing." }, { status: 403 });
  if (given !== key) return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  await clearLessons();
  return NextResponse.json({ ok: true });
}
