"use client";
import { useCallback, useEffect, useState } from "react";

const EVENT = process.env.NEXT_PUBLIC_EVENT_NAME || "Align & Elevate";
const DRAW = 4;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PresenterPage() {
  const [all, setAll] = useState([]);
  const [persistent, setPersistent] = useState(true);
  const [seen, setSeen] = useState(new Set());
  const [hand, setHand] = useState([]);
  const [idx, setIdx] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/postcards", { cache: "no-store" });
      const data = await res.json();
      setAll(data.cards);
      setPersistent(data.persistent);
    } catch { /* keep last good list */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  function draw() {
    // Prefer postcards that haven't been shown yet this session.
    const fresh = all.filter((c) => !seen.has(c.id));
    const pool = fresh.length >= DRAW ? fresh : [...shuffle(fresh), ...shuffle(all.filter((c) => seen.has(c.id)))];
    const picked = fresh.length >= DRAW ? shuffle(pool).slice(0, DRAW) : pool.slice(0, DRAW);
    setHand(picked);
    setIdx(0);
    setSeen((s) => new Set([...s, ...picked.map((c) => c.id)]));
  }

  useEffect(() => {
    function onKey(e) {
      if (!hand.length) return;
      if (e.key === "ArrowRight" || e.key === " ") setIdx((i) => Math.min(i + 1, hand.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hand.length]);

  async function clearAll() {
    const key = window.prompt("Admin key to delete all postcards:");
    if (!key) return;
    const res = await fetch("/api/postcards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return alert(out.error || "Couldn't clear postcards.");
    setAll([]); setHand([]); setSeen(new Set());
  }

  const card = hand[idx];
  const unseen = all.filter((c) => !seen.has(c.id)).length;

  return (
    <main className="display presenter">
      <header className="pr-head">
        <h1>{EVENT}</h1>
        <div className="pr-stats">
          <span className="count">{all.length}<span>{all.length === 1 ? "postcard" : "postcards"}</span></span>
          <span className="pr-unseen">{unseen} not yet shown</span>
        </div>
      </header>

      <section className="pr-stage">
        {!card ? (
          <div className="empty">
            {all.length === 0 ? "No postcards yet." : `${all.length} postcards ready.`}
            <button className="pr-draw big" onClick={draw} disabled={!all.length}>Draw {Math.min(DRAW, all.length) || DRAW} postcards</button>
          </div>
        ) : (
          <article className="postcard big" key={card.id}>
            <div className="pr-section">
              <h2>The moment</h2>
              <p className="pr-moment">{card.moment}</p>
            </div>
            <div className="pr-section">
              <h2>What it taught us</h2>
              <p className="pr-lesson">{card.lesson}</p>
            </div>
            <div className="pr-section">
              <h2><span className={`chip ${card.choice}`}>{card.choice === "keep" ? "Keep doing" : "Do differently"}</span></h2>
              <p>{card.next}</p>
            </div>
          </article>
        )}
      </section>

      <footer className="footer">
        <div className="pr-nav">
          {hand.length > 0 && (
            <>
              <button className="pr-btn" onClick={() => setIdx(idx - 1)} disabled={idx === 0} aria-label="Previous postcard">Previous</button>
              <div className="dots" aria-label={`Postcard ${idx + 1} of ${hand.length}`}>
                {hand.map((c, i) => (
                  <button key={c.id} className={i === idx ? "dot on" : "dot"} onClick={() => setIdx(i)} aria-label={`Show postcard ${i + 1}`} />
                ))}
              </div>
              <button className="pr-btn" onClick={() => setIdx(idx + 1)} disabled={idx === hand.length - 1} aria-label="Next postcard">Next</button>
            </>
          )}
        </div>
        <div className="tools">
          {!persistent && <div className="warn">Storage isn’t connected. Connect Upstash Redis in Vercel.</div>}
          {hand.length > 0 && <button className="pr-draw" onClick={draw}>Draw {DRAW} more</button>}
          <a className="pr-btn" href="/postcards/export" target="_blank" rel="noopener">Export PDF</a>
          <button className="ghost" onClick={clearAll}>Clear</button>
        </div>
      </footer>
    </main>
  );
}
