import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { listPlans, plansPerPage } from "@/lib/workspace-db";
import { updateTask } from "./actions";
import styles from "./workspace.module.css";
import { EmailForm } from "./email-form";
import { ReplyDraft } from "./reply-draft";
import { WorkspaceHeader } from "./workspace-header";
import { DeletePlanForm } from "./delete-plan-form";
import { TaskEditor } from "./task-editor";
import { TaskReview } from "./task-review";
import { taskPriorities } from "@/lib/task-priorities";
import { calendarDate, formatDueDate, taskDueDate } from "@/lib/deadlines";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; plan?: string | string[] }>;
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
      <WorkspaceHeader email={session.user.email} current="workspace" />
      <main className={`container ${styles.workspace}`}>
        <h1>Your workspace</h1>
        <p className={styles.subtitle}>Turn an email into a summary, next steps, and a draft reply.</p>
        <div className={styles.columns}>
          <section className={styles.panel} aria-label="Analyze an email">
            {plans && process.env.OPENAI_API_KEY
              ? <EmailForm />
              : <p role="alert">Email analysis is temporarily unavailable. Try again shortly.</p>}
            <p className={styles.note}>Remove private details before submitting. Email text or screenshots are sent to OpenAI for analysis. Your results are saved to your account.</p>
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
            {plans?.slice(0, plansPerPage).map((plan) => {
              const overallDate = plan.result.assignment_due_date ?? calendarDate(plan.result.assignment_deadline ?? null, plan.saved_on);
              const tasks = plan.result.tasks.flatMap((task, index) => task ? [{ ...task, index }] : []);
              const suggestions = tasks.filter((task) => task.review === "pending");
              const accepted = tasks.filter((task) => task.review !== "pending");
              const taskRows = (items: typeof tasks) => (
                <ul className={styles.planTasks}>
                    {items.map((task) => {
                      const { index } = task;
                      const done = Boolean(plan.completed[index]);
                      const date = taskDueDate(task, plan.saved_on);
                      const deadline = date ? formatDueDate(date) : task.due_date === null ? null : task.deadline;
                      return <li key={index}>
                        <strong className={styles.taskTitle}>{task.title}</strong>
                        <div className={styles.taskMeta}>
                          {deadline && <span>Due {deadline}</span>}
                          {task.priority && <span className={styles.priority} data-priority={task.priority}>{taskPriorities[task.priority]}</span>}
                          {done && <span>Completed</span>}
                        </div>
                        {task.review === "pending" ? <TaskReview planId={plan.id} index={index} /> : (
                          <>
                            <form action={updateTask.bind(null, plan.id, index, !done)}>
                              <button type="submit">{done ? "Reopen" : "Mark done"}</button>
                            </form>
                            <TaskEditor planId={plan.id} index={index} dueDate={date} priority={task.priority} />
                          </>
                        )}
                      </li>;
                    })}
                </ul>
              );
              return (
                <details key={plan.id} id={`plan-${plan.id}`} open={params.plan === plan.id || undefined}>
                  <summary>{plan.result.assignment_title ?? "Email plan"}</summary>
                  <section className={styles.planSection}>
                    <h3 className={styles.sectionTitle}>Email summary</h3>
                    <p>{plan.result.summary}</p>
                    {plan.result.assignment_deadline && <p><strong>Overall due date</strong> · {overallDate ? formatDueDate(overallDate) : plan.result.assignment_deadline}</p>}
                  </section>
                  {suggestions.length > 0 && <section className={styles.planSection}>
                    <h3 className={styles.sectionTitle}>Review suggested tasks</h3>
                    <p>Accept the actions you want on your task list and Calendar.</p>
                    {taskRows(suggestions)}
                  </section>}
                  <section className={styles.planSection}>
                    <h3 className={styles.sectionTitle}>Saved tasks</h3>
                    {accepted.length ? taskRows(accepted) : <p>No saved tasks in this plan.</p>}
                  </section>
                  <ReplyDraft draft={plan.result.reply_draft} planId={plan.id} />
                  <DeletePlanForm planId={plan.id} />
                </details>
              );
            })}
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
