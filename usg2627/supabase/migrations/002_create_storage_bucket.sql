  -- Create storage bucket for documents
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create storage policies
  CREATE POLICY "Public can view documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

  CREATE POLICY "Authenticated can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

  CREATE POLICY "Authenticated can delete documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
