-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public read access for generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Files can be updated by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Files can be deleted by anyone" ON storage.objects;

-- Create storage policies with proper error handling
DO $$ 
BEGIN
  -- Create policies with error handling
  BEGIN
    -- Public read access
    CREATE POLICY "Public read access for generated images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'images');
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
  END;

  BEGIN
    -- Upload access
    CREATE POLICY "Anyone can upload generated images"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'images');
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
  END;

  BEGIN
    -- Update access
    CREATE POLICY "Files can be updated by anyone"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'images');
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
  END;

  BEGIN
    -- Delete access
    CREATE POLICY "Files can be deleted by anyone"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'images');
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
  END;
END $$;