
-- 1. Add photo_url to journal_entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS photo_url text DEFAULT '';

-- 2. Create journal-photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-photos', 'journal-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload journal photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view journal photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-photos');

CREATE POLICY "Users can delete journal photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. College: Assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  grade TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assignments" ON public.assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignments" ON public.assignments FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. College: Class schedule table
CREATE TABLE public.class_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT DEFAULT '',
  professor TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own schedule" ON public.class_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own schedule" ON public.class_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON public.class_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON public.class_schedule FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_class_schedule_updated_at BEFORE UPDATE ON public.class_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. College: Exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'midterm',
  exam_date DATE NOT NULL,
  exam_time TIME,
  location TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  score NUMERIC,
  max_score NUMERIC DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exams" ON public.exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own exams" ON public.exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON public.exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exams" ON public.exams FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. College: Study notes table
CREATE TABLE public.study_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notes" ON public.study_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.study_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.study_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.study_notes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON public.study_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. College: GPA records
CREATE TABLE public.gpa_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  semester TEXT NOT NULL,
  subject TEXT NOT NULL,
  credits NUMERIC NOT NULL DEFAULT 3,
  grade_point NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gpa_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own gpa" ON public.gpa_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own gpa" ON public.gpa_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gpa" ON public.gpa_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gpa" ON public.gpa_records FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_gpa_records_updated_at BEFORE UPDATE ON public.gpa_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
