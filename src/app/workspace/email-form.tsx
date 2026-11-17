"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function EmailForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    body.set("workflow", "email");
    body.set("time_zone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    setError("");
    const image = body.get("image");
    if (image instanceof File && image.size > 3 * 1024 * 1024) {
      setError("Choose a screenshot under 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.id !== "string") throw new Error(result?.error ?? "Analysis is temporarily unavailable. Try again shortly.");
      form.reset();
      router.push(`/workspace?plan=${encodeURIComponent(result.id)}#plan-${encodeURIComponent(result.id)}`);
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
          <legend>Analyze an email</legend>
          <div>
            <button type="button" aria-pressed={inputMode === "text"} onClick={() => setInputMode("text")}>Paste email</button>{" "}
            <button type="button" aria-pressed={inputMode === "image"} onClick={() => setInputMode("image")}>Upload screenshot</button>
          </div>
          {inputMode === "text" ? (
            <textarea aria-label="Email text" name="text" required maxLength={12000} rows={8} placeholder="Paste the email you want to analyze…" />
          ) : (
            <label>Screenshot (PNG, JPEG, or WebP, up to 3 MB)
              <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
            </label>
          )}
          <button type="submit">{busy ? "Analyzing…" : "Analyze email"}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
