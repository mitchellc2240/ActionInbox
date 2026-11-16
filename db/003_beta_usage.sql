CREATE TABLE IF NOT EXISTS actioninbox.beta_usage (
  usage_day date PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts > 0)
);
