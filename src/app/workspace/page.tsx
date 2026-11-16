import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { getAuth } from "@/lib/auth";
import { listPlans, plansPerPage } from "@/lib/workspace-db";
import { updateTask } from "./actions";
import styles from "./workspace.module.css";
import { EmailForm } from "./email-form";
import { ReplyDraft } from "./reply-draft";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const auth = getAuth();
  const { data: session } = auth ? await auth.getSession() : { data: null };
  if (!session?.user) redirect("/account");
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10_000 ? requestedPage : 1;
  const plans = await listPlans(session.user.id, query, page).catch(() => null);
  const hasNext = Boolean(plans && plans.length > plansPerPage && page < 10_000);

  return (
    <>
      <header className="site-header">
        <div className={`container ${styles.header}`}>
          <Link href="/workspace" className="brand" aria-label="ActionInbox workspace">
            <span className="brand-icon"><Icon name="inbox" /></span>ActionInbox
          </Link>
          <Link href="/account" className={styles.account} aria-label="Your account">
            <span>{session.user.email}</span><strong>Account</strong>
          </Link>
        </div>
      </header>
      <main className={`container ${styles.workspace}`}>
        <h1>Your workspace</h1>
        <p className={styles.subtitle}>Turn an email into a summary, next steps, and a draft reply.</p>
        <div className={styles.columns}>
          <section className={styles.panel} aria-label="Analyze an email">
            {plans && process.env.OPENAI_API_KEY
              ? <EmailForm />
              : <p role="alert">Email analysis is temporarily unavailable. Try again shortly.</p>}
            <p className={styles.note}>Remove private details before submitting. Email text is sent to OpenAI for analysis. Your results are saved to your account.</p>
          </section>
          <section className={styles.panel}>
            <h2>Saved plans</h2>
            <form action="/workspace" className={styles.search}>
              <input aria-label="Search saved plans" placeholder="Search saved plans" name="q" type="search" defaultValue={query} maxLength={120} />
              <button type="submit">Search</button>
              {query && <Link href="/workspace">Clear search</Link>}
            </form>
            {!plans && <p role="alert">Could not load your saved plans. Try again shortly.</p>}
            {plans?.length === 0 && <p className={styles.empty}>{query || page > 1 ? "No matching plans on this page." : "Analyze an email to save your first plan."}</p>}
            {plans?.slice(0, plansPerPage).map((plan) => (
              <details key={plan.id}>
                <summary>{plan.result.assignment_title ?? "Email plan"}</summary>
                <p>{plan.result.summary}</p>
                {plan.result.assignment_deadline && <p>Overall due date · {plan.result.assignment_deadline}</p>}
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
        </div>
      </main>
    </>
  );
}
