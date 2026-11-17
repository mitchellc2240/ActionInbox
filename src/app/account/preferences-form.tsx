"use client";

import { useActionState, useState } from "react";
import { preferenceOptions, type AnalysisPreferences } from "@/lib/analysis-preferences";
import { savePreferences, type SaveResult } from "./preference-actions";

const labels = {
  summary_length: "Summary length",
  task_scope: "Which actions to include",
  reply_tone: "Draft reply tone",
} satisfies Record<keyof typeof preferenceOptions, string>;

export function PreferencesForm({ preferences }: { preferences: AnalysisPreferences }) {
  const [values, setValues] = useState<Record<keyof AnalysisPreferences, string>>(preferences);
  const [result, action, pending] = useActionState<SaveResult, FormData>(savePreferences, { status: "idle", message: "" });

  return (
    <form action={action}>
      <fieldset disabled={pending}>
        {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
          <label key={key}>
            {labels[key]}
            <select name={key} value={values[key]} onChange={(event) => {
              setValues({ ...values, [key]: event.target.value });
            }}>
              {Object.entries(preferenceOptions[key]).map(([value, option]) => (
                <option key={value} value={value}>{option.label}</option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Reply sign-off (optional)
          <textarea name="reply_sign_off" rows={2} maxLength={160} placeholder={"Thanks,\nTaylor"}
            value={values.reply_sign_off} onChange={(event) => setValues({ ...values, reply_sign_off: event.target.value })} />
        </label>
        <button type="submit">{pending ? "Saving…" : "Save preferences"}</button>
      </fieldset>
      {result.message && <p role={result.status === "error" ? "alert" : "status"}>{result.message}</p>}
    </form>
  );
}
