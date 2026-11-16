import Link from "next/link";
import { getAuth } from "@/lib/auth";
import styles from "../demo/demo.module.css";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  const user = session?.user;
  const support = process.env.ACTIONINBOX_SUPPORT_EMAIL;

  return (
    <main className={styles.demo}>
      <Link href={user ? "/workspace" : "/"}>{user ? "← Workspace" : "← ActionInbox"}</Link>
      <h1>Your ActionInbox account</h1>
      {auth ? <AccountForm email={session?.user.email} /> : <p>Account setup is in progress.</p>}
      {support && <p>Need help? <a href={`mailto:${support}`}>Contact ActionInbox support</a>.</p>}
    </main>
  );
}
