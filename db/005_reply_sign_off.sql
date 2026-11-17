ALTER TABLE actioninbox.analysis_preferences
  ADD COLUMN IF NOT EXISTS reply_sign_off text NOT NULL DEFAULT ''
  CHECK (char_length(reply_sign_off) <= 160);
