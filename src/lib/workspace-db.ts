import { neon } from "@neondatabase/serverless";
import { defaultPreferences, type AnalysisPreferences } from "./analysis-preferences";
import type { TaskPriority } from "./task-priorities";

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return neon(url);
}

export async function getAnalysisPreferences(userId: string): Promise<AnalysisPreferences> {
  const [preferences] = await database()`
    SELECT summary_length, task_scope, reply_tone, reply_sign_off
    FROM actioninbox.analysis_preferences
    WHERE user_id = ${userId}
  ` as AnalysisPreferences[];
  return preferences ?? defaultPreferences;
}

export async function saveAnalysisPreferences(userId: string, preferences: AnalysisPreferences) {
  await database()`
    INSERT INTO actioninbox.analysis_preferences (user_id, summary_length, task_scope, reply_tone, reply_sign_off)
    VALUES (${userId}, ${preferences.summary_length}, ${preferences.task_scope}, ${preferences.reply_tone}, ${preferences.reply_sign_off})
    ON CONFLICT (user_id) DO UPDATE SET
      summary_length = EXCLUDED.summary_length,
      task_scope = EXCLUDED.task_scope,
      reply_tone = EXCLUDED.reply_tone,
      reply_sign_off = EXCLUDED.reply_sign_off
  `;
}

export async function reserveAnalysis(userId: string) {
  const rows = await database()`
    WITH account_attempt AS (
      INSERT INTO actioninbox.analysis_usage AS usage (user_id, usage_day, attempts)
      VALUES (${userId}, (now() AT TIME ZONE 'UTC')::date, 1)
      ON CONFLICT (user_id, usage_day) DO UPDATE SET attempts = usage.attempts + 1
      WHERE usage.attempts < 20
      RETURNING usage_day
    )
    INSERT INTO actioninbox.beta_usage AS usage (usage_day, attempts)
    SELECT usage_day, 1 FROM account_attempt
    ON CONFLICT (usage_day) DO UPDATE SET attempts = usage.attempts + 1
    WHERE usage.attempts < 200
    RETURNING attempts
  `;
  return rows.length === 1;
}

export async function savePlan(userId: string, result: string) {
  const [row] = await database()`
    INSERT INTO actioninbox.plans (user_id, result)
    VALUES (${userId}, ${result}::jsonb)
    RETURNING id
  `;
  return row.id as string;
}

export type SavedPlan = {
  id: string;
  saved_on: string;
  result: {
    assignment_title: string | null;
    summary: string;
    assignment_deadline?: string | null;
    assignment_due_date?: string | null;
    reply_draft: string;
    tasks: ({
      title: string;
      deadline: string | null;
      due_date?: string | null;
      priority?: TaskPriority | null;
      review?: "pending" | "accepted";
    } | null)[];
  };
  completed: Record<string, boolean>;
};

export const plansPerPage = 25;

export async function listPlans(userId: string, query: string, page: number) {
  return await database()`
    SELECT id, result, completed, (created_at AT TIME ZONE 'UTC')::date::text AS saved_on
    FROM actioninbox.plans
    WHERE user_id = ${userId}
      AND (${query} = '' OR strpos(lower(result::text), lower(${query})) > 0)
    ORDER BY created_at DESC, id DESC
    LIMIT ${plansPerPage + 1} OFFSET ${(page - 1) * plansPerPage}
  ` as SavedPlan[];
}

export async function listTaskPlans(userId: string) {
  return await database()`
    SELECT id, result->>'assignment_title' AS title, result->'tasks' AS tasks, completed,
      (created_at AT TIME ZONE 'UTC')::date::text AS saved_on
    FROM actioninbox.plans
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
  ` as {
    id: string;
    title: string | null;
    tasks: SavedPlan["result"]["tasks"];
    completed: SavedPlan["completed"];
    saved_on: string;
  }[];
}

export async function setTask(userId: string, planId: string, index: number, done: boolean) {
  await database()`
    UPDATE actioninbox.plans
    SET completed = jsonb_set(completed, ARRAY[${String(index)}]::text[], to_jsonb(${done}::boolean))
    WHERE user_id = ${userId} AND id = ${planId}::uuid
      AND jsonb_typeof(result->'tasks'->${index}::integer) = 'object'
      AND (result->'tasks'->${index}::integer->>'review') IS DISTINCT FROM 'pending'
  `;
}

export async function editSavedTask(userId: string, planId: string, index: number,
  changes: { review: "accepted" } | { due_date: string | null; priority: TaskPriority | null } | null,
  reviewing: boolean,
) {
  const path = ["tasks", String(index)];
  const remove = changes === null;
  const rows = await database()`
    UPDATE actioninbox.plans
    SET result = jsonb_set(result, ${path}::text[],
          CASE WHEN ${remove}::boolean THEN 'null'::jsonb
               ELSE (result #> ${path}::text[]) || ${JSON.stringify(changes)}::jsonb
          END),
        completed = CASE WHEN ${remove}::boolean THEN completed - ${String(index)}::text ELSE completed END
    WHERE user_id = ${userId} AND id = ${planId}::uuid
      AND jsonb_typeof(result #> ${path}::text[]) = 'object'
      AND (COALESCE(result #>> (${path}::text[] || 'review'::text), '') = 'pending') = ${reviewing}::boolean
    RETURNING id
  `;
  return rows.length === 1;
}

export async function saveReplyDraft(userId: string, planId: string, draft: string) {
  const rows = await database()`
    UPDATE actioninbox.plans
    SET result = jsonb_set(result, '{reply_draft}', to_jsonb(${draft}::text))
    WHERE user_id = ${userId} AND id = ${planId}::uuid
    RETURNING id
  `;
  return rows.length === 1;
}

export async function deletePlan(userId: string, planId: string) {
  await database()`
    DELETE FROM actioninbox.plans
    WHERE user_id = ${userId} AND id = ${planId}::uuid
  `;
}
