import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { canUseWorkspace } from "@/lib/billing";
import { listPlans, plansPerPage } from "@/lib/workspace-db";
import { updateTask } from "./actions";
import styles from "../demo/demo.module.css";
import { EmailForm } from "./email-form";
import { ReplyDraft } from "./reply-draft";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  if (!session?.user || !await canUseWorkspace(session.user.id)) redirect("/account");
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10_000 ? requestedPage : 1;
  const plans = await listPlans(session.user.id, query, page);
  const hasNext = plans.length > plansPerPage && page < 10_000;

  return (
    <main className={styles.demo}>
      <Link href="/account">← Your account</Link>
      <h1>Turn a client email into a checklist</h1>
      <p>Remove private details before submitting. Your email text goes to OpenAI for analysis. ActionInbox saves the generated plan and task status in your account, and allows up to 20 analysis attempts per UTC day.</p>
      <EmailForm />
      <section>
        <h2>Saved plans</h2>
        <form action="/workspace">
          <label>Search plans<input name="q" type="search" defaultValue={query} maxLength={120} /></label>
          <button type="submit">Search</button>
          {query && <Link href="/workspace">Clear search</Link>}
        </form>
        {!plans.length && <p>{query || page > 1 ? "No matching plans on this page." : "Your analyses will appear here."}</p>}
        {plans.slice(0, plansPerPage).map((plan) => (
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
            <ReplyDraft draft={plan.result.reply_draft} />
          </details>
        ))}
        {(page > 1 || hasNext) && <nav aria-label="Saved plan pages">
          {page > 1 && <Link href={{ pathname: "/workspace", query: { q: query, page: page - 1 } }}>Newer plans</Link>}
          {" · Page "}{page}{" · "}
          {hasNext && <Link href={{ pathname: "/workspace", query: { q: query, page: page + 1 } }}>Older plans</Link>}
        </nav>}
      </section>
    </main>
  );
}
