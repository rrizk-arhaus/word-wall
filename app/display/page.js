"use client";
import { useEffect, useRef, useState } from "react";

const PROMPT = process.env.NEXT_PUBLIC_PROMPT || "Describe today in one word.";
const POLL_MS = 1500;

function colorFor(word) {
  let h = 0;
  for (const ch of word) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return `c${h % 4}`;
}

export default function DisplayPage() {
  const [data, setData] = useState({ words: [], total: 0, persistent: true });
  const [bumped, setBumped] = useState(new Set());
  const [origin, setOrigin] = useState("");
  const prev = useRef(new Map());

  useEffect(() => {
    setOrigin(window.location.host);
    let alive = true;
    let timer;

    async function poll() {
      try {
        const res = await fetch("/api/words", { cache: "no-store" });
        const next = await res.json();
        if (!alive) return;
        const changed = new Set();
        for (const { word, count } of next.words) {
          const before = prev.current.get(word);
          if (before !== undefined && count > before) changed.add(word);
        }
        prev.current = new Map(next.words.map((w) => [w.word, w.count]));
        setData(next);
        if (changed.size) {
          setBumped(changed);
          setTimeout(() => alive && setBumped(new Set()), 750);
        }
      } catch {
        /* keep the last good frame on screen */
      }
      if (alive) timer = setTimeout(poll, POLL_MS);
    }
    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  async function reset() {
    const key = window.prompt("Admin key to clear all words:");
    if (!key) return;
    const res = await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return alert(out.error || "Reset failed.");
    prev.current = new Map();
    setData((d) => ({ ...d, words: [], total: 0 }));
  }

  const max = Math.max(1, ...data.words.map((w) => w.count));
  // Shrink the scale a little as the wall fills up so it stays on one screen.
  const n = data.words.length;
  const maxRem = n > 50 ? 6 : n > 25 ? 8 : 10;
  const minRem = n > 50 ? 1.1 : 1.5;
  // Put the biggest words in the middle and let smaller ones fan out to both sides.
  const ordered = [];
  data.words.forEach((w, i) => (i % 2 ? ordered.push(w) : ordered.unshift(w)));

  return (
    <main className="display">
      <h1>{PROMPT}</h1>

      <section className="cloud" aria-live="polite">
        {n === 0 ? (
          <div className="empty">
            Waiting for the first word. Go to
            <strong>{origin || "this site"}</strong>
          </div>
        ) : (
          ordered.map(({ word, count }) => {
            const size = minRem + (maxRem - minRem) * Math.sqrt(count / max);
            return (
              <span
                key={word}
                className={`w ${colorFor(word)}${bumped.has(word) ? " bump" : ""}`}
                style={{ fontSize: `${size.toFixed(2)}rem` }}
                title={`${count}`}
              >
                {word}
              </span>
            );
          })
        )}
      </section>

      <footer className="footer">
        <div className="join">
          Add yours at <strong>{origin}</strong>
          {!data.persistent && (
            <div className="warn">Storage isn’t connected, so words may not be shared between visitors. Connect Upstash Redis in Vercel.</div>
          )}
        </div>
        <div className="tools">
          <div className="count">{data.total}<span>{data.total === 1 ? "word" : "words"}</span></div>
          <button className="ghost" onClick={reset}>Clear</button>
        </div>
      </footer>
    </main>
  );
}
