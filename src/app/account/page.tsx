import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { getPilotCheckoutUrl, hasPilotAccess } from "@/lib/pilot";
import styles from "../demo/demo.module.css";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  const user = session?.user;
  const active = user ? hasPilotAccess(user.id) : false;
  const checkout = user && !active ? getPilotCheckoutUrl(user.id, user.email) : null;

  return (
    <main className={styles.demo}>
      <Link href="/">← ActionInbox</Link>
      <h1>Your ActionInbox account</h1>
      {auth ? <AccountForm email={session?.user.email} /> : <p>Account setup is in progress.</p>}
      {active && <p><Link href="/workspace">Open your email workspace</Link></p>}
      {checkout && (
        <section>
          <h2>ActionInbox paid pilot</h2>
          <p>Stripe shows the price and billing terms before payment. Access is activated after we confirm payment.</p>
          <a href={checkout}>Continue to Stripe Checkout</a>
        </section>
      )}
    </main>
  );
}
