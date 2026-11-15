import { NextResponse } from "next/server";
import { addPostcard, clearPostcards, getPostcards, usingRedis, validate } from "@/lib/postcards";

export const dynamic = "force-dynamic";

export async function GET() {
  const cards = await getPostcards();
  return NextResponse.json({ cards, persistent: usingRedis }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const card = validate(body);
  if (!card) return NextResponse.json({ error: "Fill in all three parts of the postcard." }, { status: 400 });
  await addPostcard(card);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const key = process.env.ADMIN_KEY;
  const { key: given } = await req.json().catch(() => ({}));
  if (!key) return NextResponse.json({ error: "Set ADMIN_KEY in Vercel to enable clearing." }, { status: 403 });
  if (given !== key) return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  await clearPostcards();
  return NextResponse.json({ ok: true });
}
