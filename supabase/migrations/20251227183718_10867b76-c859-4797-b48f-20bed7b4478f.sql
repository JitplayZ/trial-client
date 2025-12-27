-- =====================================================
-- SECURITY FIX: Make avatars bucket private
-- The RLS policy already exists, just need to make bucket private
-- =====================================================

-- Change bucket to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';