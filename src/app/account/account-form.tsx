"use client";

import { useState, type FormEvent } from "react";
import { createAuthClient } from "@neon/auth/next";

const auth = createAuthClient();

export function AccountForm({ email }: { email?: string }) {
  const [signup, setSignup] = useState(false);
  const [recovery, setRecovery] = useState<"request" | "reset" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const credentials = {
      email: String(fields.get("email")).trim(),
      password: String(fields.get("password")),
    };

    setBusy(true);
    setMessage("");
    try {
      if (recovery === "request") {
        await auth.forgetPassword.emailOtp({ email: credentials.email });
        setRecovery("reset");
        setMessage("If an account exists for that address, check your email for a reset code.");
        return;
      }
      if (recovery === "reset") {
        const { error } = await auth.emailOtp.resetPassword({
          ...credentials,
          otp: String(fields.get("otp")).trim(),
        });
        if (error) {
          setMessage("Could not reset your password. Check the code or request a new one.");
        } else {
          setRecovery(null);
          setMessage("Password updated. Sign in with your new password.");
        }
        return;
      }
      const { data, error } = signup
        ? await auth.signUp.email({ ...credentials, name: String(fields.get("name")).trim() })
        : await auth.signIn.email(credentials);

      if (error) {
        setMessage(signup ? "Could not create your account. Check your details and try again." : "Could not sign in. Check your credentials and email verification.");
      } else if (signup && !data?.token) {
        setMessage("Check your email for a verification link, then sign in.");
      } else {
        window.location.assign("/account");
      }
    } catch {
      setMessage("Accounts are temporarily unavailable. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      window.location.assign("/account");
    } catch {
      setMessage("Could not sign out. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {email ? (
        <>
          <p>Signed in as {email}</p>
          <button type="button" disabled={busy} onClick={signOut}>Sign out</button>
        </>
      ) : (
        <form onSubmit={submit} key={String(signup)}>
          <fieldset disabled={busy}>
            {signup && <label>Name<input name="name" autoComplete="name" required maxLength={100} /></label>}
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            {recovery === "reset" && <label>Reset code<input name="otp" autoComplete="one-time-code" inputMode="numeric" required maxLength={12} /></label>}
            {recovery !== "request" && <label>{recovery ? "New password" : "Password"}<input key={recovery ?? "password"} name="password" type="password" autoComplete={signup || recovery ? "new-password" : "current-password"} required minLength={signup || recovery ? 8 : undefined} maxLength={128} /></label>}
            <button type="submit">{recovery === "request" ? "Send reset code" : recovery === "reset" ? "Reset password" : signup ? "Create account" : "Sign in"}</button>
            {recovery ? <>
              {recovery === "reset" && <button type="button" onClick={() => { setRecovery("request"); setMessage(""); }}>Request a new code</button>}
              <button type="button" onClick={() => { setRecovery(null); setMessage(""); }}>Back to sign in</button>
            </> : <>
              <button type="button" onClick={() => { setSignup(!signup); setMessage(""); }}>
                {signup ? "I already have an account" : "Create an account instead"}
              </button>
              {!signup && <button type="button" onClick={() => { setRecovery("request"); setMessage(""); }}>Forgot password?</button>}
            </>}
          </fieldset>
        </form>
      )}
      <p role="status">{message}</p>
    </>
  );
}
