"use client";

import { useActionState, useState } from "react";
import { removePlan } from "./actions";
import styles from "./workspace.module.css";

export function DeletePlanForm({ planId }: { planId: string }) {
  const [error, action, pending] = useActionState(removePlan.bind(null, planId), "");
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <div className={styles.deletePlan}>
        <button type="button" onClick={() => setConfirming(true)}>Delete plan</button>
      </div>
    );
  }

  return (
    <form className={styles.deletePlan} action={action}>
      <p>Delete this plan and its tasks permanently?</p>
      <button type="submit" disabled={pending}>{pending ? "Deleting…" : "Confirm deletion"}</button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)}>Cancel</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
