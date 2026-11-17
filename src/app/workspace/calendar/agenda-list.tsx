"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { formatCalendarDate } from "@/lib/deadlines";
import { taskPriorities, type TaskPriority } from "@/lib/task-priorities";
import { updateTask } from "../actions";
import { TaskEditor } from "../task-editor";
import styles from "../workspace.module.css";
import calendar from "./calendar.module.css";

type AgendaTask = {
  planId: string;
  planTitle: string | null;
  index: number;
  title: string;
  done: boolean;
  date: string | null;
  deadline: string | null;
  priority?: TaskPriority | null;
};

function taskKey(task: AgendaTask) {
  return `${task.planId}-${task.index}`;
}

function TaskRow({ task, selected, onSelect }: { task: AgendaTask; selected: boolean; onSelect: () => void }) {
  const [done, setDone] = useOptimistic(task.done);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle(checked: boolean) {
    setError("");
    startTransition(async () => {
      setDone(checked);
      try {
        await updateTask(task.planId, task.index, checked);
      } catch {
        setError("Could not update this task. Try again.");
      }
    });
  }

  return (
    <li className={calendar.task} data-selected={selected || undefined}>
      <label className={calendar.checkbox}>
        <input type="checkbox" checked={done} disabled={pending}
          aria-label={`Mark ${task.title} ${done ? "open" : "done"}`}
          onChange={(event) => toggle(event.currentTarget.checked)} />
      </label>
      <button type="button" className={calendar.taskName} id={`task-${taskKey(task)}`}
        onClick={onSelect} aria-expanded={selected} aria-controls={selected ? "calendar-task-details" : undefined}>
        <span className={done ? calendar.done : undefined}>{task.title}</span>
        {task.priority && <span className={styles.priority} data-priority={task.priority}>{taskPriorities[task.priority]}</span>}
      </button>
      {error && <p className={calendar.rowError} role="alert">{error}</p>}
    </li>
  );
}

export function AgendaList({ dated, undated }: { dated: [string, AgendaTask[]][]; undated: AgendaTask[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const detail = useRef<HTMLElement>(null);
  const selected = dated.flatMap(([, tasks]) => tasks).concat(undated).find((task) => taskKey(task) === selectedKey);

  useEffect(() => {
    if (selectedKey) {
      detail.current?.querySelector("h3")?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 760px)").matches) detail.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedKey]);

  function close() {
    document.getElementById(`task-${selectedKey}`)?.focus();
    setSelectedKey(null);
  }

  const taskList = (tasks: AgendaTask[]) => (
    <ul className={calendar.taskList}>
      {tasks.map((task) => {
        const key = taskKey(task);
        return <TaskRow key={key} task={task} selected={selectedKey === key}
          onSelect={() => setSelectedKey(selectedKey === key ? null : key)} />;
      })}
    </ul>
  );

  return (
    <div className={selected ? calendar.agendaSplit : undefined}>
      <div>
        {dated.map(([date, tasks]) => (
          <section key={date} id={`tasks-${date}`} className={calendar.group}>
            <h3><time dateTime={date}>{formatCalendarDate(new Date(`${date}T00:00:00Z`), { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</time></h3>
            {taskList(tasks)}
          </section>
        ))}
        {undated.length > 0 && <section className={calendar.group}><h3>Without a calendar date</h3>{taskList(undated)}</section>}
      </div>
      {selected && (
        <aside ref={detail} className={calendar.detail} id="calendar-task-details" aria-labelledby="task-detail-title">
          <div className={calendar.detailHeader}>
            <h3 id="task-detail-title" tabIndex={-1}>{selected.title}</h3>
            <button type="button" className={calendar.closeDetails} aria-label="Close task details" onClick={close}>×</button>
          </div>
          <p className={styles.subtitle}>{selected.planTitle ?? "Email plan"}</p>
          {!selected.date && selected.deadline && <p className={styles.note}>Email deadline · {selected.deadline}</p>}
          <TaskEditor key={selectedKey} planId={selected.planId} index={selected.index} dueDate={selected.date}
            priority={selected.priority} expanded />
        </aside>
      )}
    </div>
  );
}
