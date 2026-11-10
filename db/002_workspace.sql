CREATE SCHEMA IF NOT EXISTS actioninbox;

CREATE TABLE IF NOT EXISTS actioninbox.billing_customers (
  user_id text PRIMARY KEY,
  customer_id text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS actioninbox.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  result jsonb NOT NULL,
  completed jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plans_user_created
  ON actioninbox.plans (user_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS actioninbox.analysis_usage (
  user_id text NOT NULL,
  usage_day date NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0),
  PRIMARY KEY (user_id, usage_day)
);
