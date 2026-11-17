const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function localDate(date: Date, timeZone = "UTC") {
  const format = (zone: string) => new Intl.DateTimeFormat("en-CA", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
  try {
    return format(timeZone);
  } catch {
    return format("UTC");
  }
}

function dateKey(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

export function calendarDate(deadline: string | null, reference?: string) {
  const text = deadline?.trim().replace(/^(?:(?:due|by|on)\s+)+/i, "")
    .replace(/^(?:sun|mon|tue|wed|thu|fri|sat)[a-z]*,\s+/i, "")
    .replace(/\s+(?:at\s+)?(?:\d{1,2}:\d{2}\s*(?:[ap]\.?m\.?)?|\d{1,2}\s*[ap]\.?m\.?|noon|midnight)(?:\s+[A-Z]{2,5})?$/i, "")
    .replace(/\s+(?:eod|cob|end of day|close of business)$/i, "")
    .replace(/[.,]$/, "") ?? "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) return dateKey(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const anchor = reference ? new Date(`${reference}T00:00:00Z`) : null;
  if (anchor && Number.isFinite(anchor.getTime())) {
    const relative = /^(?:(this|next|upcoming)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/i.exec(text);
    const interval = /^in\s+(\d{1,3})\s+(days?|weeks?)$/i.exec(text);
    let days: number | null = null;
    if (relative) {
      const weekday = weekdays.indexOf(relative[2].toLowerCase());
      days = relative[1]?.toLowerCase() === "next"
        ? 7 - ((anchor.getUTCDay() + 6) % 7) + ((weekday + 6) % 7)
        : (weekday - anchor.getUTCDay() + 7) % 7;
    } else if (/^today$/i.test(text)) {
      days = 0;
    } else if (/^tomorrow$/i.test(text)) {
      days = 1;
    } else if (interval) {
      days = Number(interval[1]) * (/^week/i.test(interval[2]) ? 7 : 1);
    }
    if (days !== null) {
      anchor.setUTCDate(anchor.getUTCDate() + days);
      return anchor.toISOString().slice(0, 10);
    }
  }

  const monthFirst = /^([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?$/i.exec(text);
  const dayFirst = /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?(?:\s+(\d{4}))?$/i.exec(text);
  const numeric = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(text);
  if (!monthFirst && !dayFirst && !numeric) return null;
  const name = (monthFirst?.[1] ?? dayFirst?.[2] ?? "").toLowerCase();
  const month = numeric ? Number(numeric[1]) : months.findIndex(
    (value) => [value.toLowerCase(), value.slice(0, 3).toLowerCase()].includes(name === "sept" ? "sep" : name),
  ) + 1;
  const day = Number(monthFirst?.[2] ?? dayFirst?.[1] ?? numeric?.[2]);
  const year = (monthFirst ?? dayFirst ?? numeric)?.[3];
  if (year) return dateKey(Number(year), month, day);
  if (!anchor || !reference) return null;
  for (let offset = 0; offset <= 4; offset++) {
    const candidate = dateKey(anchor.getUTCFullYear() + offset, month, day);
    if (candidate && candidate >= reference) return candidate;
  }
  return null;
}

export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function formatCalendarDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

export function taskDueDate(task: { deadline: string | null; due_date?: string | null }, reference: string) {
  return task.due_date === undefined ? calendarDate(task.deadline, reference) : task.due_date;
}

export function formatDueDate(date: string) {
  return formatCalendarDate(new Date(`${date}T00:00:00Z`), { month: "short", day: "numeric", year: "numeric" });
}
