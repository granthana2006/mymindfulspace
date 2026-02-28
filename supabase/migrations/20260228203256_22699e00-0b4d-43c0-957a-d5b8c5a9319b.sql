
-- Create storage bucket for study note file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('study-files', 'study-files', true);

-- RLS policies for study-files bucket
CREATE POLICY "Users can view their own study files"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own study files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own study files"
ON storage.objects FOR DELETE
USING (bucket_id = 'study-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file_url column to study_notes
ALTER TABLE public.study_notes ADD COLUMN IF NOT EXISTS file_url text DEFAULT '';
ALTER TABLE public.study_notes ADD COLUMN IF NOT EXISTS file_name text DEFAULT '';
