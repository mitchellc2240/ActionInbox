CREATE TABLE IF NOT EXISTS actioninbox.analysis_preferences (
  user_id text PRIMARY KEY,
  summary_length text NOT NULL CHECK (summary_length IN ('brief', 'standard', 'detailed')),
  task_scope text NOT NULL CHECK (task_scope IN ('direct', 'include_followups')),
  reply_tone text NOT NULL CHECK (reply_tone IN ('professional', 'warm', 'direct'))
);
