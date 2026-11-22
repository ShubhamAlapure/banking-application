-- Migration: Add avatar_url and storage policies
-- Run if public.profiles does not already have avatar_url

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ensure avatars storage bucket exists (created via Supabase API)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Allow public read access to avatars
CREATE POLICY IF NOT EXISTS "Public Read Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users Can Upload Own Avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: Allow authenticated users to update their own avatar
CREATE POLICY IF NOT EXISTS "Users Can Update Own Avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
