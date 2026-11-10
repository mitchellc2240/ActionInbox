import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { hasPilotAccess } from "@/lib/pilot";
import styles from "../demo/demo.module.css";
import { EmailForm } from "./email-form";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  if (!session?.user || !hasPilotAccess(session.user.id)) redirect("/account");

  return (
    <main className={styles.demo}>
      <Link href="/account">← Your account</Link>
      <h1>Turn a client email into a checklist</h1>
      <p>Remove private details before submitting. Your input is sent to OpenAI for analysis.</p>
      <EmailForm />
    </main>
  );
}
