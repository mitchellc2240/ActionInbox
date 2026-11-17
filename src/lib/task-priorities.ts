export const taskPriorities = { urgent: "Urgent", medium: "Medium", low: "Low" } as const;
export type TaskPriority = keyof typeof taskPriorities;

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && Object.hasOwn(taskPriorities, value);
}
