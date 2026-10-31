-- ============================================================
-- Receipt Scans rate-limiting table for SplitScore
-- Paste this into the Supabase SQL Editor and run it.
-- Safe to run more than once (create if not exists).
-- ============================================================

CREATE TABLE IF NOT EXISTS receipt_scans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  status     text NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'error', 'rate_limited'))
);

-- Index for the per-user-per-day rate limit query
CREATE INDEX IF NOT EXISTS idx_receipt_scans_user_date
  ON receipt_scans (user_id, created_at DESC);

-- Index for the global-per-day rate limit query
CREATE INDEX IF NOT EXISTS idx_receipt_scans_date
  ON receipt_scans (created_at DESC);
