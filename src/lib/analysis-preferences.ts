export const preferenceOptions = {
  summary_length: {
    brief: { label: "Brief", instruction: "Write a one-sentence summary." },
    standard: { label: "Standard", instruction: "Summarize the main request and key context in two or three concise sentences." },
    detailed: { label: "Detailed", instruction: "Summarize the request, context, constraints, and important details in up to five concise sentences." },
  },
  task_scope: {
    direct: { label: "Direct requests only", instruction: "Include only actions explicitly requested or assigned to the recipient." },
    include_followups: { label: "Include implied follow-ups", instruction: "Include direct requests first, plus strongly implied follow-ups grounded in the email. Prefix each implied task title with 'Suggested: '." },
  },
  reply_tone: {
    professional: { label: "Professional", instruction: "Use a neutral, professional tone in the draft reply." },
    warm: { label: "Warm", instruction: "Use a friendly, personable tone in the draft reply." },
    direct: { label: "Direct", instruction: "Use a straightforward tone in the draft reply and lead with the main point." },
  },
} as const;

export type AnalysisPreferences = {
  [Field in keyof typeof preferenceOptions]: keyof (typeof preferenceOptions)[Field];
};

export const defaultPreferences: AnalysisPreferences = {
  summary_length: "standard",
  task_scope: "direct",
  reply_tone: "professional",
};

function isChoice<T extends object>(choices: T, value: unknown): value is keyof T {
  return typeof value === "string" && Object.hasOwn(choices, value);
}

export function parsePreferences(form: FormData): AnalysisPreferences | null {
  const summary_length = form.get("summary_length");
  const task_scope = form.get("task_scope");
  const reply_tone = form.get("reply_tone");
  if (!isChoice(preferenceOptions.summary_length, summary_length) ||
      !isChoice(preferenceOptions.task_scope, task_scope) ||
      !isChoice(preferenceOptions.reply_tone, reply_tone)) return null;
  return { summary_length, task_scope, reply_tone };
}

export function preferenceInstructions({ summary_length, task_scope, reply_tone }: AnalysisPreferences) {
  return [
    preferenceOptions.summary_length[summary_length].instruction,
    preferenceOptions.task_scope[task_scope].instruction,
    preferenceOptions.reply_tone[reply_tone].instruction,
  ];
}
