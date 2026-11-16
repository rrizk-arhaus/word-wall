"use client";
import { useEffect, useState } from "react";

const EVENT = process.env.NEXT_PUBLIC_EVENT_NAME || "Align & Elevate";
const TITLE = "Lessons for go-live";
const POLL_MS = 5000;

const fmtDate = (d) => d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

export default function LessonsPage() {
  const [lessons, setLessons] = useState(null);
  const [persistent, setPersistent] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `${TITLE} - ${EVENT}`; // also the default PDF file name
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/lessons", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setLessons([...data.lessons].sort((a, b) => a.at - b.at));
        setPersistent(data.persistent);
        setError("");
      } catch {
        if (alive) setError("Couldn't load lessons. Retrying…");
      }
    }
    load();
    const t = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!lessons) return <main className="ex"><p>{error || "Loading lessons…"}</p></main>;

  return (
    <main className="ex">
      <div className="ex-toolbar no-print">
        <span>
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}. To download, choose <strong>Save as PDF</strong> in the print dialog.
        </span>
        <button onClick={() => window.print()} disabled={!lessons.length}>Download PDF</button>
      </div>
      {!persistent && <p className="error no-print">Storage isn’t connected, so this list may be missing lessons. Connect Upstash Redis in Vercel.</p>}
      {error && <p className="error no-print">{error}</p>}

      <section className="ex-cover">
        <h1>{TITLE}</h1>
        <p className="ex-event">{EVENT}</p>
        <p className="ex-meta">{fmtDate(new Date())}</p>
        <dl className="ex-stats">
          <div><dt>Lessons</dt><dd>{lessons.length}</dd></div>
        </dl>
      </section>

      {lessons.length === 0 ? (
        <p>No lessons yet. Share the /lesson page to collect them.</p>
      ) : (
        <section className="ex-group">
          {lessons.map((l, i) => (
            <article className="ex-card" key={l.id}>
              <div className="ex-num">{i + 1}</div>
              <div className="ex-body">
                <p className="ex-lesson">{l.lesson}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
