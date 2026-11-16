"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { deletePlan, setTask } from "@/lib/workspace-db";

const planIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function updateTask(planId: string, index: number, done: boolean) {
  const auth = getAuth();
  const session = auth && (await auth.getSession()).data;
  if (!session?.user) throw new Error("Access required.");
  if (typeof planId !== "string" || !planIdPattern.test(planId) || !Number.isInteger(index) || index < 0 || index >= 8 || typeof done !== "boolean") {
    throw new Error("Invalid task.");
  }
  await setTask(session.user.id, planId, index, done);
  revalidatePath("/workspace");
  revalidatePath("/workspace/calendar");
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
  revalidatePath("/workspace");
  revalidatePath("/workspace/calendar");
  return "";
}
