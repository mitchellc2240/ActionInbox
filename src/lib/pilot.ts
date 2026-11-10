export function hasPilotAccess(userId: string) {
  if (process.env.VERCEL_ENV === "production") return false;
  return Boolean(userId) && (process.env.ACTIONINBOX_PILOT_USER_IDS ?? "").split(",").some((id) => id.trim() === userId);
}
