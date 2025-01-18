-- Create storage bucket for wishlist uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishlist-uploads', 'wishlist-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for wishlist uploads
CREATE POLICY "Public read access for wishlist uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wishlist-uploads');

CREATE POLICY "Anyone can upload wishlist images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wishlist-uploads');

CREATE POLICY "Files can be updated by anyone"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'wishlist-uploads');

CREATE POLICY "Files can be deleted by anyone"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'wishlist-uploads');