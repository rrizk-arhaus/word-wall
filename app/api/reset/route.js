import { NextResponse } from "next/server";
import { resetWords } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const key = process.env.ADMIN_KEY;
  const { key: given } = await req.json().catch(() => ({}));
  if (!key) return NextResponse.json({ error: "Set ADMIN_KEY in Vercel to enable reset." }, { status: 403 });
  if (given !== key) return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  await resetWords();
  return NextResponse.json({ ok: true });
}
