import { neon } from "@neondatabase/serverless";

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return neon(url);
}

export async function reserveAnalysis(userId: string) {
  const rows = await database()`
    INSERT INTO actioninbox.analysis_usage AS usage (user_id, usage_day, attempts)
    VALUES (${userId}, (now() AT TIME ZONE 'UTC')::date, 1)
    ON CONFLICT (user_id, usage_day) DO UPDATE SET attempts = usage.attempts + 1
    WHERE usage.attempts < 20
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
  result: {
    assignment_title: string | null;
    summary: string;
    reply_draft: string;
    tasks: { title: string; deadline: string | null }[];
  };
  completed: Record<string, boolean>;
};

export async function listPlans(userId: string) {
  return await database()`
    SELECT id, result, completed FROM actioninbox.plans
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT 25
  ` as SavedPlan[];
}

export async function setTask(userId: string, planId: string, index: number, done: boolean) {
  await database()`
    UPDATE actioninbox.plans
    SET completed = jsonb_set(completed, ARRAY[${String(index)}]::text[], to_jsonb(${done}::boolean))
    WHERE user_id = ${userId} AND id = ${planId}::uuid
      AND ${index}::integer < jsonb_array_length(result->'tasks')
  `;
}
