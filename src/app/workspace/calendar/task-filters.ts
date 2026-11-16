export const taskFilters = {
  all: "All",
  open: "Open",
  overdue: "Overdue",
  completed: "Completed",
} as const;

export type TaskFilter = keyof typeof taskFilters;

export function parseTaskFilter(value: string | string[] | undefined): TaskFilter {
  return typeof value === "string" && Object.hasOwn(taskFilters, value) ? value as TaskFilter : "all";
}

export function matchesTaskFilter(task: { done: boolean; date: string | null }, filter: TaskFilter, today: string) {
  switch (filter) {
    case "all": return true;
    case "open": return !task.done;
    case "completed": return task.done;
    case "overdue": return !task.done && task.date !== null && task.date < today;
  }
}
