"use client";

import { useActionState, useState } from "react";
import { updateReplyDraft } from "./actions";
import styles from "./workspace.module.css";

export function ReplyDraft({ draft, planId }: { draft: string; planId: string }) {
  const [message, setMessage] = useState("");
  const [text, setText] = useState(draft);
  const [result, action, pending] = useActionState(updateReplyDraft.bind(null, planId), { message: "", error: false });

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Draft copied.");
    } catch {
      setMessage("Select the draft text and copy it manually.");
    }
  }

  return (
    <form action={action} className={styles.planSection}>
      <label className={styles.sectionTitle}>Draft reply
        <textarea value={text} name="reply_draft" rows={5} maxLength={12000}
          onChange={(event) => { setText(event.target.value); setMessage(""); }} />
      </label>
      <div className={styles.controlRow}>
        <button type="submit" disabled={pending || text === draft}>{pending ? "Saving…" : "Save draft"}</button>
        <button type="button" onClick={copy} disabled={!text.trim()}>Copy draft</button>
      </div>
      <span role="status"> {message}</span>
      {result.message && <p role={result.error ? "alert" : "status"}>{result.message}</p>}
    </form>
  );
}
