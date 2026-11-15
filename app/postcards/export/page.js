"use client";
import { useEffect, useState } from "react";

const EVENT = process.env.NEXT_PUBLIC_EVENT_NAME || "Align & Elevate";
const TITLE = process.env.NEXT_PUBLIC_PLAYBOOK_TITLE || "Keystone playbook";

const fmtDate = (d) => d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

function Card({ c, n }) {
  return (
    <article className="ex-card">
      <div className="ex-num">{n}</div>
      <div className="ex-body">
        <h3>The moment</h3>
        <p className="ex-moment">{c.moment}</p>
        <h3>What it taught us</h3>
        <p className="ex-lesson">{c.lesson}</p>
        <h3>{c.choice === "keep" ? "Keep doing" : "Do differently"}</h3>
        <p>{c.next}</p>
      </div>
    </article>
  );
}

export default function ExportPage() {
  const [cards, setCards] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/postcards", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCards([...d.cards].sort((a, b) => a.at - b.at)))
      .catch(() => setError("Couldn't load postcards. Refresh the page to try again."));
  }, []);

  useEffect(() => {
    if (cards?.length) {
      document.title = `${TITLE} - ${EVENT}`;
      const t = setTimeout(() => window.print(), 600); // let the font settle first
      return () => clearTimeout(t);
    }
  }, [cards]);

  if (error) return <main className="ex"><p>{error}</p></main>;
  if (!cards) return <main className="ex"><p>Loading postcards…</p></main>;

  const keep = cards.filter((c) => c.choice === "keep");
  const change = cards.filter((c) => c.choice === "change");
  let n = 0;

  return (
    <main className="ex">
      <div className="ex-toolbar no-print">
        <span>In the print dialog, choose <strong>Save as PDF</strong> as the destination.</span>
        <button onClick={() => window.print()}>Save as PDF</button>
      </div>

      <section className="ex-cover">
        <h1>{TITLE}</h1>
        <p className="ex-event">{EVENT}</p>
        <p className="ex-meta">{fmtDate(new Date())}</p>
        <dl className="ex-stats">
          <div><dt>Postcards</dt><dd>{cards.length}</dd></div>
          <div><dt>Keep doing</dt><dd>{keep.length}</dd></div>
          <div><dt>Do differently</dt><dd>{change.length}</dd></div>
        </dl>
      </section>

      {cards.length === 0 && <p>No postcards yet.</p>}

      {[["Keep doing", keep], ["Do differently", change]].map(([label, list]) =>
        list.length ? (
          <section className="ex-group" key={label}>
            <h2>{label}</h2>
            <p className="ex-group-sub">{list.length} {list.length === 1 ? "postcard" : "postcards"}</p>
            {list.map((c) => <Card key={c.id} c={c} n={++n} />)}
          </section>
        ) : null
      )}
    </main>
  );
}
