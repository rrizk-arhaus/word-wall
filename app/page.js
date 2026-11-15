"use client";
import { useState } from "react";

const PROMPT = process.env.NEXT_PUBLIC_PROMPT || "Describe today in one word.";

export default function SubmitPage() {
  const [word, setWord] = useState("");
  const [sent, setSent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    setError("");
    const w = word.trim();
    if (!w) return setError("Type a word first.");
    if (/\s/.test(w)) return setError("Just one word, with no spaces.");
    setBusy(true);
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't send that word.");
      setSent(data.word);
      setWord("");
    } catch (err) {
      setError(err.message || "Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <main className="submit">
        <div className="submit-inner sent">
          <div className="sent-word">{sent}</div>
          <p>Sent. Look up at the screen.</p>
          <button className="link-btn" onClick={() => setSent(null)}>Send another word</button>
        </div>
      </main>
    );
  }

  return (
    <main className="submit">
      <form className="submit-inner" onSubmit={send}>
        <h1 className="prompt">{PROMPT}</h1>
        <div className="field">
          <input
            aria-label="Your word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Your word"
            maxLength={24}
            autoComplete="off"
            autoCapitalize="none"
            autoFocus
          />
          <button type="submit" disabled={busy}>{busy ? "Sending" : "Send word"}</button>
        </div>
        {error ? <p className="error" role="alert">{error}</p> : <p className="hint">One word, up to 24 letters.</p>}
      </form>
    </main>
  );
}
