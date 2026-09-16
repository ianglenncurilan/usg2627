-- Migration 014: Add role_badge column to members table

ALTER TABLE members ADD COLUMN IF NOT EXISTS role_badge TEXT;
