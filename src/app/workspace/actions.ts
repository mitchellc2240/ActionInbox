"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { deletePlan, editSavedTask, setTask } from "@/lib/workspace-db";
import { calendarDate } from "@/lib/deadlines";

const planIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function isTaskReference(planId: string, index: number) {
  return typeof planId === "string" && planIdPattern.test(planId) && Number.isInteger(index) && index >= 0 && index < 8;
}

function refreshTasks() {
  revalidatePath("/workspace");
  revalidatePath("/workspace/calendar");
}

export async function updateTask(planId: string, index: number, done: boolean) {
  const auth = getAuth();
  const session = auth && (await auth.getSession()).data;
  if (!session?.user) throw new Error("Access required.");
  if (!isTaskReference(planId, index) || typeof done !== "boolean") {
    throw new Error("Invalid task.");
  }
  await setTask(session.user.id, planId, index, done);
  refreshTasks();
}

export async function changeTask(planId: string, index: number, _previous: string, form: FormData) {
  if (!isTaskReference(planId, index)) return "Invalid task.";
  const intent = form.get("intent");
  if (intent !== "date" && intent !== "remove") return "Choose a task action.";
  const date = form.get("due_date");
  if (intent === "date" && (typeof date !== "string" ||
    (date !== "" && (!/^(19\d{2}|2\d{3})-\d{2}-\d{2}$/.test(date) || calendarDate(date) !== date)))) {
    return "Choose a valid date.";
  }
  try {
    const auth = getAuth();
    const session = auth && (await auth.getSession()).data;
    if (!session?.user) return "Sign in again to edit this task.";
    const saved = await editSavedTask(session.user.id, planId, index, intent === "date" && date ? String(date) : null, intent === "remove");
    if (!saved) return "This task is no longer available.";
  } catch {
    return "Could not update the task. Try again shortly.";
  }
  refreshTasks();
  return "";
}

export async function removePlan(planId: string, _previous: string, _form: FormData) {
  if (typeof planId !== "string" || !planIdPattern.test(planId)) return "Invalid plan.";
  try {
    const auth = getAuth();
    const session = auth && (await auth.getSession()).data;
    if (!session?.user) return "Sign in again to delete this plan.";
    await deletePlan(session.user.id, planId);
  } catch {
    return "Could not delete the plan. Try again shortly.";
  }
  refreshTasks();
  return "";
}
