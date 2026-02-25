
-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'tbr',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  description TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own books" ON public.books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for book photos
INSERT INTO storage.buckets (id, name, public) VALUES ('book-photos', 'book-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view book photos" ON storage.objects FOR SELECT USING (bucket_id = 'book-photos');
CREATE POLICY "Users can upload book photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their book photos" ON storage.objects FOR UPDATE USING (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their book photos" ON storage.objects FOR DELETE USING (bucket_id = 'book-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
