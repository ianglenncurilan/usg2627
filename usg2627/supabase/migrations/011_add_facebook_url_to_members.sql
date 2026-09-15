-- Migration 011: Ensure facebook_url column exists on members table for Facebook profile links

ALTER TABLE members ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Optional default for existing members without a Facebook link
UPDATE members
SET facebook_url = 'https://www.facebook.com/csumain.usg'
WHERE facebook_url IS NULL OR facebook_url = '';
