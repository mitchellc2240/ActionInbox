import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { canUseWorkspace, findCustomer, getBilling } from "@/lib/billing";
import { openBilling } from "./billing-actions";
import styles from "../demo/demo.module.css";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  const user = session?.user;
  const active = user ? await canUseWorkspace(user.id) : false;
  const billing = user ? getBilling() : null;
  const customer = user && billing ? await findCustomer(user.id) : null;
  const support = process.env.ACTIONINBOX_SUPPORT_EMAIL;

  return (
    <main className={styles.demo}>
      <Link href="/">← ActionInbox</Link>
      <h1>Your ActionInbox account</h1>
      {auth ? <AccountForm email={session?.user.email} /> : <p>Account setup is in progress.</p>}
      {active && <p><Link href="/workspace">Open your email workspace</Link></p>}
      {(await searchParams).billing === "unavailable" && <p role="alert">Billing is temporarily unavailable.</p>}
      {billing && (
        <section>
          <h2>ActionInbox subscription</h2>
          <form action={openBilling}>
            {!active && <button name="intent" value="checkout">Subscribe with Stripe</button>}
            {customer && <button name="intent" value="portal">Manage billing</button>}
          </form>
        </section>
      )}
      {support && <p>Need help? <a href={`mailto:${support}`}>Contact ActionInbox support</a>.</p>}
    </main>
  );
}
