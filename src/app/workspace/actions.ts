"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { deletePlan, editSavedTask, saveReplyDraft, setTask } from "@/lib/workspace-db";
import { calendarDate } from "@/lib/deadlines";
import { isTaskPriority } from "@/lib/task-priorities";

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
  if (intent !== "edit" && intent !== "remove" && intent !== "accept" && intent !== "decline") return "Choose a task action.";
  const date = form.get("due_date");
  const priority = form.get("priority");
  if (intent === "edit" && (typeof date !== "string" ||
    (date !== "" && (!/^(19\d{2}|2\d{3})-\d{2}-\d{2}$/.test(date) || calendarDate(date) !== date)))) {
    return "Choose a valid date.";
  }
  if (intent === "edit" && priority !== "" && !isTaskPriority(priority)) return "Choose a valid priority.";
  try {
    const auth = getAuth();
    const session = auth && (await auth.getSession()).data;
    if (!session?.user) return "Sign in again to edit this task.";
    const changes = intent === "accept" ? { review: "accepted" as const }
      : intent === "edit" ? { due_date: date ? String(date) : null, priority: isTaskPriority(priority) ? priority : null }
      : null;
    const saved = await editSavedTask(session.user.id, planId, index, changes, intent === "accept" || intent === "decline");
    if (!saved) return "This task is no longer available.";
  } catch {
    return "Could not update the task. Try again shortly.";
  }
  refreshTasks();
  return "";
}

export async function updateReplyDraft(planId: string, _previous: { message: string; error: boolean }, form: FormData) {
  const draft = form.get("reply_draft");
  if (typeof planId !== "string" || !planIdPattern.test(planId) || typeof draft !== "string" || draft.length > 12000) {
    return { message: "Enter a draft of up to 12,000 characters.", error: true };
  }
  try {
    const auth = getAuth();
    const session = auth && (await auth.getSession()).data;
    if (!session?.user) return { message: "Sign in again to save this draft.", error: true };
    if (!await saveReplyDraft(session.user.id, planId, draft)) return { message: "This plan is no longer available.", error: true };
  } catch {
    return { message: "Could not save the draft. Try again shortly.", error: true };
  }
  revalidatePath("/workspace");
  return { message: "Draft saved.", error: false };
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
