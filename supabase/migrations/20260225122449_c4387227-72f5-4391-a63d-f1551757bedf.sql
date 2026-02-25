
-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'movie',
  genre TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'watchlist',
  rating INTEGER,
  review TEXT DEFAULT '',
  poster_url TEXT DEFAULT '',
  year TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own movies"
ON public.movies FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own movies"
ON public.movies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
ON public.movies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
ON public.movies FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_movies_updated_at
BEFORE UPDATE ON public.movies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
