"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { setTask } from "@/lib/workspace-db";

export async function updateTask(planId: string, index: number, done: boolean) {
  const auth = getAuth();
  const session = auth && (await auth.getSession()).data;
  if (!session?.user) throw new Error("Access required.");
  if (typeof planId !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(planId) || !Number.isInteger(index) || index < 0 || index >= 8 || typeof done !== "boolean") {
    throw new Error("Invalid task.");
  }
  await setTask(session.user.id, planId, index, done);
  revalidatePath("/workspace");
}
