/*
  # Add storage policies for super_admin

  1. Changes
    - Add storage policies to allow super_admin full access to all buckets
    - Update existing policies to include super_admin role
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "storage_objects_read_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_insert_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_update_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_delete_20250120" ON storage.objects;

-- Create new storage policies that include super_admin role
CREATE POLICY "storage_objects_read_20250122"
ON storage.objects FOR SELECT
TO public
USING (true);

CREATE POLICY "storage_objects_insert_20250122"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.profiles ON auth.users.id = profiles.id
    WHERE auth.users.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "storage_objects_update_20250122"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.profiles ON auth.users.id = profiles.id
    WHERE auth.users.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "storage_objects_delete_20250122"
ON storage.objects FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.profiles ON auth.users.id = profiles.id
    WHERE auth.users.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id 
ON storage.objects(bucket_id);

CREATE INDEX IF NOT EXISTS idx_storage_objects_owner 
ON storage.objects(owner);