"use client";

import { useActionState, useState } from "react";
import { changeTask } from "./actions";
import styles from "./workspace.module.css";

export function TaskEditor({ planId, index, dueDate }: { planId: string; index: number; dueDate: string | null }) {
  const [error, action, pending] = useActionState(changeTask.bind(null, planId, index), "");
  const [confirming, setConfirming] = useState(false);

  return (
    <details className={styles.taskEditor}>
      <summary>{dueDate ? "Edit task" : "Add date or edit task"}</summary>
      <form action={action} className={styles.taskEditorForm}>
        {confirming ? (
          <>
            <span>Delete this task?</span>
            <button type="submit" name="intent" value="remove" disabled={pending}>Confirm deletion</button>
            <button type="button" disabled={pending} onClick={() => setConfirming(false)}>Cancel</button>
          </>
        ) : (
          <>
            <label>Due date<input key={dueDate ?? "undated"} type="date" name="due_date" defaultValue={dueDate ?? ""} min="1900-01-01" max="2999-12-31" /></label>
            <button type="submit" name="intent" value="date" disabled={pending}>{pending ? "Saving…" : "Save date"}</button>
            <button type="button" disabled={pending} onClick={() => setConfirming(true)}>Delete task</button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </details>
  );
}
