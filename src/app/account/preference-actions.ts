"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { parsePreferences } from "@/lib/analysis-preferences";
import { saveAnalysisPreferences } from "@/lib/workspace-db";

export type SaveResult = { status: "idle" | "success" | "error"; message: string };

export async function savePreferences(_previous: SaveResult, form: FormData): Promise<SaveResult> {
  const preferences = parsePreferences(form);
  if (!preferences) return { status: "error", message: "Choose a valid option for each preference." };

  try {
    const auth = getAuth();
    const session = auth && (await auth.getSession()).data;
    if (!session?.user) return { status: "error", message: "Sign in again to save your preferences." };
    await saveAnalysisPreferences(session.user.id, preferences);
  } catch {
    return { status: "error", message: "Could not save preferences. Try again shortly." };
  }

  revalidatePath("/account");
  return { status: "success", message: "Preferences saved." };
}
