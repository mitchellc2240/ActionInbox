const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dateKey(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

export function calendarDate(deadline: string | null) {
  const text = deadline?.trim().replace(/^by\s+/i, "") ?? "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) return dateKey(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const monthFirst = /^([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i.exec(text);
  const dayFirst = /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?\s+(\d{4})$/i.exec(text);
  if (!monthFirst && !dayFirst) return null;
  const name = (monthFirst?.[1] ?? dayFirst?.[2] ?? "").toLowerCase();
  const month = months.findIndex((value) => [value.toLowerCase(), value.slice(0, 3).toLowerCase()].includes(name)) + 1;
  return dateKey(Number((monthFirst ?? dayFirst)?.[3]), month, Number(monthFirst?.[2] ?? dayFirst?.[1]));
}

export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function formatCalendarDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}
