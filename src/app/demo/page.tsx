"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import styles from "./demo.module.css";

type Plan = { summary: string; assignment_title: string | null; assignment_deadline: string | null; tasks: { title: string; deadline: string | null }[] };

export default function Demo() {
  const [mode, setMode] = useState("text");
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    setPlan(null);
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Analysis failed.");
      setPlan(result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.demo}>
      <Link href="/">← ActionInbox</Link>
      <h1>Turn a message into a checklist</h1>
      <p>Paste assignment instructions or upload a screenshot of a Canvas assignment.</p>
      <p>Use sample material or crop out names, grades and private details. Your submission is sent to OpenAI for analysis.</p>
      <form onSubmit={analyze}>
        <fieldset disabled={loading}>
          <label>Demo access code<input name="code" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={128} /></label>
          <label>Input type
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="text">Pasted text</option>
              <option value="image">Screenshot</option>
            </select>
          </label>
          {mode === "text" ? (
            <>
              <label>Message or instructions
                <textarea name="text" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={12000} rows={7} />
              </label>
              <button type="button" onClick={() => setMessage("For Friday, submit a one-page proposal in Canvas. Include a research question, two sources, and a short outline. Bring a copy to class for peer review.")}>Use a sample</button>
            </>
          ) : (
            <label>Screenshot (PNG, JPEG or WebP, up to 3 MB)
              <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
            </label>
          )}
          <button type="submit">{loading ? "Analyzing…" : "Analyze"}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {plan && (
        <section aria-live="polite">
          <h2>Your checklist</h2>
          {plan.tasks.length === 0 ? <p>No clear tasks found.</p> : (
            <div className={styles.assignment}>
              <input
                type="checkbox"
                aria-label={`Complete ${plan.assignment_title ?? "assignment"}`}
              />
              <details>
                <summary>
                  {plan.assignment_title ?? "Assignment"}
                  {plan.assignment_deadline ? (
                    <small> · Due {plan.assignment_deadline}</small>
                  ) : (
                    <small className={styles.missingDeadline}>Deadline needed</small>
                  )}
                </summary>
                <p>{plan.summary}</p>
                <ol>
                  {plan.tasks.map((task, index) => (
                    <li key={index}>
                      {task.title}
                      {task.deadline && task.deadline !== plan.assignment_deadline && <small> · Due {task.deadline}</small>}
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
