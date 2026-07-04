
-- 1) Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated (triggers still work)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2) Drop existing overly-permissive storage.objects policies for our buckets
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN (
        'Anyone can view book photos',
        'Users can delete journal photos',
        'Users can delete their book photos',
        'Users can delete their own study files',
        'Users can update their book photos',
        'Users can view journal photos',
        'Users can view their own study files',
        'Users can upload book photos',
        'Users can upload journal photos',
        'Users can upload their own study files',
        'Users can update journal photos',
        'Users can update their own study files'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

-- 3) Owner-scoped policies (folder prefix = auth.uid()) for the three buckets
CREATE POLICY "book_photos_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "book_photos_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "book_photos_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "book_photos_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "journal_photos_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "journal_photos_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "journal_photos_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "journal_photos_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "study_files_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "study_files_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "study_files_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "study_files_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);
