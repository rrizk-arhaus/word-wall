"use client";
import { useState } from "react";

const EVENT = process.env.NEXT_PUBLIC_EVENT_NAME || "Align & Elevate";
const LIMITS = { moment: 300, lesson: 160, next: 200 };
const EMPTY = { moment: "", lesson: "", choice: "keep", next: "" };

export default function PostcardPage() {
  const [card, setCard] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setCard({ ...card, [k]: e.target.value });

  async function send(e) {
    e.preventDefault();
    setError("");
    if (!card.moment.trim() || !card.lesson.trim() || !card.next.trim()) {
      return setError("Fill in all three parts before sending.");
    }
    setBusy(true);
    try {
      const res = await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      setCard(EMPTY);
    } catch (err) {
      setError(err.message || "Couldn't send your postcard. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <main className="pc-page">
        <div className="pc-wrap sent">
          <div className="sent-word">Postcard sent.</div>
          <p>It may get picked to share with the room.</p>
          <button className="link-btn" onClick={() => setSent(false)}>Write another postcard</button>
        </div>
      </main>
    );
  }

  return (
    <main className="pc-page">
      <form className="pc-wrap" onSubmit={send}>
        <h1 className="pc-title">{EVENT} postcard</h1>
        <p className="pc-intro">Answers are anonymous.</p>

        <div className="postcard">
          <label className="pc-field">
            <span className="pc-label">The moment</span>
            <span className="pc-help">What happened, in one or two sentences.</span>
            <textarea rows={3} maxLength={LIMITS.moment} value={card.moment} onChange={set("moment")} />
            <span className="pc-count">{card.moment.length}/{LIMITS.moment}</span>
          </label>

          <label className="pc-field">
            <span className="pc-label">What it taught us</span>
            <span className="pc-help">The lesson, in one sentence.</span>
            <textarea rows={2} maxLength={LIMITS.lesson} value={card.lesson} onChange={set("lesson")} />
            <span className="pc-count">{card.lesson.length}/{LIMITS.lesson}</span>
          </label>

          <fieldset className="pc-field">
            <legend className="pc-label">Keep or change</legend>
            <div className="toggle" role="radiogroup">
              {[["keep", "Keep doing"], ["change", "Do differently"]].map(([v, label]) => (
                <label key={v} className={card.choice === v ? "on" : ""}>
                  <input type="radio" name="choice" value={v} checked={card.choice === v} onChange={set("choice")} />
                  {label}
                </label>
              ))}
            </div>
            <span className="pc-help">
              {card.choice === "keep" ? "What should the team keep doing?" : "What should the team do differently next time?"}
            </span>
            <textarea rows={2} maxLength={LIMITS.next} value={card.next} onChange={set("next")} aria-label="Keep or change" />
            <span className="pc-count">{card.next.length}/{LIMITS.next}</span>
          </fieldset>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="pc-send" type="submit" disabled={busy}>{busy ? "Sending" : "Send postcard"}</button>
      </form>
    </main>
  );
}
