"use client";

import { useState, type FormEvent } from "react";

type Plan = {
  summary: string;
  tasks: { title: string; deadline: string | null }[];
  reply_draft: string;
};

export function EmailForm() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    body.set("workflow", "email");
    setPlan(null);
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Analysis failed.");
      setPlan(result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>Client email<textarea name="text" required maxLength={12000} rows={7} /></label>
          <button type="submit">{busy ? "Analyzing…" : "Analyze email"}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {plan && <section aria-live="polite">
        <h2>Your checklist</h2>
        <p>{plan.summary}</p>
        {plan.tasks.length ? <ol>
          {plan.tasks.map((task, index) => <li key={index}>{task.title}{task.deadline && ` · Due ${task.deadline}`}</li>)}
        </ol> : <p>No clear tasks found.</p>}
        <label>Draft reply<textarea readOnly value={plan.reply_draft} rows={5} /></label>
      </section>}
    </>
  );
}
