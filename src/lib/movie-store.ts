import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  user_id: string;
  title: string;
  type: "movie" | "series";
  genre: string;
  status: "watchlist" | "watching" | "watched";
  rating: number | null;
  review: string;
  poster_url: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export const MOVIE_GENRES = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Fantasy",
  "Documentary",
  "Animation",
  "Crime",
  "Mystery",
  "Adventure",
  "Other",
] as const;

export async function getMovies(userId: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Movie[]) ?? [];
}

export async function createMovie(movie: Omit<Movie, "id" | "created_at" | "updated_at">): Promise<Movie> {
  const { data, error } = await supabase.from("movies").insert(movie).select().single();
  if (error) throw error;
  return data as unknown as Movie;
}

export async function deleteMovie(id: string): Promise<void> {
  const { error } = await supabase.from("movies").delete().eq("id", id);
  if (error) throw error;
}
