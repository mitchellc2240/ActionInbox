"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { canUseWorkspace } from "@/lib/billing";
import { setTask } from "@/lib/workspace-db";

export async function updateTask(planId: string, index: number, done: boolean) {
  const auth = getAuth();
  const session = auth && (await auth.getSession()).data;
  if (!session?.user || !await canUseWorkspace(session.user.id)) throw new Error("Access required.");
  if (!/^[0-9a-f-]{36}$/i.test(planId) || !Number.isInteger(index) || index < 0 || index >= 8 || typeof done !== "boolean") {
    throw new Error("Invalid task.");
  }
  await setTask(session.user.id, planId, index, done);
  revalidatePath("/workspace");
}
