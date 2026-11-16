import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { listTaskPlans } from "@/lib/workspace-db";
import { updateTask } from "../actions";
import { WorkspaceHeader } from "../workspace-header";
import styles from "../workspace.module.css";
import calendar from "./calendar.module.css";
import { calendarDate, formatCalendarDate, monthKey } from "./dates";

export const dynamic = "force-dynamic";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({ searchParams }: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const auth = getAuth();
  const session = auth ? (await auth.getSession()).data : null;
  if (!session?.user) redirect("/account");

  const plans = await listTaskPlans(session.user.id).catch(() => null);
  const { month } = await searchParams;
  const currentMonth = monthKey(new Date());
  const selectedMonth = typeof month === "string" && /^(19\d{2}|2\d{3})-(0[1-9]|1[0-2])$/.test(month)
    ? month
    : currentMonth;
  const first = new Date(`${selectedMonth}-01T00:00:00Z`);
  const year = first.getUTCFullYear();
  const monthIndex = first.getUTCMonth();
  const dayCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const tasks = (plans ?? []).flatMap((plan) => plan.tasks.map((task, index) => ({
    ...task, index, planId: plan.id, planTitle: plan.title, done: Boolean(plan.completed[index]),
    date: calendarDate(task.deadline),
  })));
  const byDate = new Map<string, typeof tasks>();
  const undated = [];
  for (const task of tasks) {
    if (!task.date) {
      undated.push(task);
      continue;
    }
    const day = byDate.get(task.date) ?? [];
    day.push(task);
    byDate.set(task.date, day);
  }
  const agenda = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));

  function taskList(items: typeof tasks) {
    return (
      <ul className={calendar.taskList}>
        {items.map((task) => (
          <li key={`${task.planId}-${task.index}`} className={calendar.task}>
            <div>
              <strong className={task.done ? calendar.done : undefined}>{task.title}</strong>
              <p className={styles.subtitle}>
                {task.planTitle ?? "Email plan"}{task.deadline && ` · Due ${task.deadline}`}
                {task.done && " · Completed"}
              </p>
            </div>
            <form action={updateTask.bind(null, task.planId, task.index, !task.done)}>
              <button type="submit">{task.done ? "Reopen" : "Mark done"}</button>
            </form>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <WorkspaceHeader email={session.user.email} current="calendar" />
      <main className={`container ${styles.workspace}`}>
        <h1>Calendar</h1>
        <p className={styles.subtitle}>Due dates and tasks from your saved plans.</p>
        {!plans ? <p className={calendar.error} role="alert">Could not load your tasks. Try again shortly.</p> : (
          <>
            <section className={`${styles.panel} ${calendar.section}`} aria-labelledby="month-heading">
              <div className={calendar.monthHeader}>
                <h2 id="month-heading">{formatCalendarDate(first, { month: "long", year: "numeric" })}</h2>
                <nav className={calendar.monthLinks} aria-label="Calendar months">
                  {selectedMonth !== "1900-01" && <Link href={{ query: { month: monthKey(new Date(Date.UTC(year, monthIndex - 1, 1))) } }} aria-label="Previous month">←</Link>}
                  <Link href="/workspace/calendar">Today</Link>
                  {selectedMonth !== "2999-12" && <Link href={{ query: { month: monthKey(new Date(Date.UTC(year, monthIndex + 1, 1))) } }} aria-label="Next month">→</Link>}
                </nav>
              </div>
              <div className={calendar.grid}>
                {weekdays.map((day) => <div key={day} className={calendar.weekday}>{day}</div>)}
                {Array.from({ length: first.getUTCDay() }, (_, index) => <div key={`blank-${index}`} aria-hidden="true" />)}
                {Array.from({ length: dayCount }, (_, index) => {
                  const day = index + 1;
                  const date = `${selectedMonth}-${String(day).padStart(2, "0")}`;
                  const due = byDate.get(date);
                  return due?.length ? (
                    <a key={date} href={`#tasks-${date}`} className={calendar.day}
                      aria-label={`${formatCalendarDate(new Date(`${date}T00:00:00Z`), { month: "long", day: "numeric" })}, ${due.length} ${due.length === 1 ? "task" : "tasks"}`}>
                      <span>{day}</span><small>{due.length}</small>
                    </a>
                  ) : <div key={date} className={calendar.day}>{day}</div>;
                })}
              </div>
            </section>
            <section className={`${styles.panel} ${calendar.section}`} aria-labelledby="tasks-heading">
              <h2 id="tasks-heading">All saved tasks</h2>
              {!tasks.length && <p className={calendar.empty}>Analyze an email in your <Link href="/workspace">workspace</Link> to add tasks.</p>}
              {agenda.map(([date, items]) => (
                <section key={date} id={`tasks-${date}`} className={calendar.group}>
                  <h3><time dateTime={date}>{formatCalendarDate(new Date(`${date}T00:00:00Z`), { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</time></h3>
                  {taskList(items)}
                </section>
              ))}
              {!!undated.length && (
                <section className={calendar.group}>
                  <h3>Without a calendar date</h3>
                  {undated.some((task) => task.deadline) && <p className={styles.note}>Deadlines such as “Friday” stay here until the email provides a full date.</p>}
                  {taskList(undated)}
                </section>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
