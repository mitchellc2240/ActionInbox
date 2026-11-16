import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { getAnalysisPreferences } from "@/lib/workspace-db";
import styles from "../demo/demo.module.css";
import { AccountForm } from "./account-form";
import { PreferencesForm } from "./preferences-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  const user = session?.user;
  const preferences = user ? await getAnalysisPreferences(user.id).catch(() => null) : null;
  const support = process.env.ACTIONINBOX_SUPPORT_EMAIL;

  return (
    <main className={styles.demo}>
      <Link href={user ? "/workspace" : "/"}>{user ? "← Workspace" : "← ActionInbox"}</Link>
      <h1>Your ActionInbox account</h1>
      {auth ? <AccountForm email={session?.user.email} /> : <p>Account setup is in progress.</p>}
      {user && (
        <section aria-labelledby="preferences-heading">
          <h2 id="preferences-heading">AI preferences</h2>
          <p>These settings apply to new email analyses.</p>
          {preferences
            ? <PreferencesForm preferences={preferences} />
            : <p role="alert">Could not load your preferences. Try again shortly.</p>}
        </section>
      )}
      {support && <p>Need help? <a href={`mailto:${support}`}>Contact ActionInbox support</a>.</p>}
    </main>
  );
}
