"use client";

import { useState } from "react";

export function ReplyDraft({ draft }: { draft: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setMessage("Draft copied.");
    } catch {
      setMessage("Select the draft text and copy it manually.");
    }
  }

  return (
    <div>
      <label>Draft reply<textarea readOnly value={draft} rows={5} /></label>
      <button type="button" onClick={copy} disabled={!draft}>Copy draft</button>
      <span role="status"> {message}</span>
    </div>
  );
}
