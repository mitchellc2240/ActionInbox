"use client";

import { useActionState } from "react";
import { changeTask } from "./actions";
import styles from "./workspace.module.css";

export function TaskReview({ planId, index }: { planId: string; index: number }) {
  const [error, action, pending] = useActionState(changeTask.bind(null, planId, index), "");

  return (
    <form action={action} className={styles.controlRow}>
      <button type="submit" name="intent" value="accept" disabled={pending}>✓ Accept</button>
      <button type="submit" name="intent" value="decline" disabled={pending}>× Decline</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
