import { NextResponse } from "next/server";
import { addWord, getWords, normalize, usingRedis } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getWords();
  return NextResponse.json({ ...data, persistent: usingRedis }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON like { \"word\": \"hello\" }." }, { status: 400 });
  }
  const word = normalize(body?.word);
  if (!word) {
    return NextResponse.json({ error: "Enter one word, up to 24 letters, with no spaces." }, { status: 400 });
  }
  await addWord(word);
  return NextResponse.json({ ok: true, word });
}
