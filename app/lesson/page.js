"use client";
import { useState } from "react";

const EVENT = process.env.NEXT_PUBLIC_EVENT_NAME || "Align & Elevate";
const MAX = 200;

export default function LessonPage() {
  const [lesson, setLesson] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setError("");
    if (!lesson.trim()) return setError("Write your lesson before sending.");
    setBusy(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      setLesson("");
    } catch (err) {
      setError(err.message || "Couldn't send your lesson. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <main className="pc-page">
        <div className="pc-wrap sent">
          <div className="sent-word">Lesson sent.</div>
          <p>Thanks. We'll carry it into go-live.</p>
          <button className="link-btn" onClick={() => setSent(false)}>Send another lesson</button>
        </div>
      </main>
    );
  }

  return (
    <main className="pc-page">
      <form className="pc-wrap" onSubmit={send}>
        <h1 className="pc-title">One lesson for go-live</h1>
        <p className="pc-intro">{EVENT}. Answers are anonymous.</p>

        <div className="postcard">
          <label className="pc-field">
            <span className="pc-label">Your lesson</span>
            <span className="pc-help">What's one thing we should carry into go-live?</span>
            <textarea rows={4} maxLength={MAX} value={lesson} onChange={(e) => setLesson(e.target.value)} autoFocus />
            <span className="pc-count">{lesson.length}/{MAX}</span>
          </label>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="pc-send" type="submit" disabled={busy}>{busy ? "Sending" : "Send lesson"}</button>
      </form>
    </main>
  );
}
