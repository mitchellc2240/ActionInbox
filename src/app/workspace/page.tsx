import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { canUseWorkspace } from "@/lib/billing";
import { listPlans } from "@/lib/workspace-db";
import { updateTask } from "./actions";
import styles from "../demo/demo.module.css";
import { EmailForm } from "./email-form";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  if (!session?.user || !await canUseWorkspace(session.user.id)) redirect("/account");
  const plans = await listPlans(session.user.id);

  return (
    <main className={styles.demo}>
      <Link href="/account">← Your account</Link>
      <h1>Turn a client email into a checklist</h1>
      <p>Remove private details before submitting. Your email text goes to OpenAI for analysis. ActionInbox saves the generated plan and task status in your account, and allows up to 20 analysis attempts per UTC day.</p>
      <EmailForm />
      <section>
        <h2>Recent saved plans</h2>
        {!plans.length && <p>Your analyses will appear here.</p>}
        {plans.map((plan) => (
          <details key={plan.id}>
            <summary>{plan.result.assignment_title ?? "Email plan"}</summary>
            <p>{plan.result.summary}</p>
            <ul>
              {plan.result.tasks.map((task, index) => {
                const done = Boolean(plan.completed[index]);
                return <li key={index}>
                  <form action={updateTask.bind(null, plan.id, index, !done)}>
                    <span>{task.title}{task.deadline && ` · Due ${task.deadline}`} </span>
                    <button type="submit">{done ? "Reopen" : "Mark done"}</button>
                    {done && <span> Completed</span>}
                  </form>
                </li>;
              })}
            </ul>
            <label>Draft reply<textarea readOnly value={plan.result.reply_draft} rows={5} /></label>
          </details>
        ))}
      </section>
    </main>
  );
}
