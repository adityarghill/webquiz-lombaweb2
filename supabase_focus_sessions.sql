-- Focus Sessions Table Migration for Supabase
-- Run this SQL in your Supabase dashboard SQL Editor

CREATE TABLE IF NOT EXISTS focus_sessions (
  id             uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid   text    NOT NULL,
  session_date   date    NOT NULL DEFAULT CURRENT_DATE,
  material       text    DEFAULT '',
  target         text    DEFAULT '',
  duration_seconds integer NOT NULL,
  completed_at   timestamptz DEFAULT now()
);

-- Index untuk query harian
CREATE INDEX IF NOT EXISTS idx_focus_sessions_uid_date
  ON focus_sessions (firebase_uid, session_date);

-- Enable Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
  ON focus_sessions FOR SELECT
  USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can insert their own sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update their own sessions"
  ON focus_sessions FOR UPDATE
  USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can delete their own sessions"
  ON focus_sessions FOR DELETE
  USING (firebase_uid = auth.uid()::text);
