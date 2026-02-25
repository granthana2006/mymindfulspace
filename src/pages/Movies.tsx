import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Movie, getMovies, createMovie, deleteMovie, MOVIE_GENRES } from "@/lib/movie-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMovieForm from "@/components/movies/AddMovieForm";
import MovieCard from "@/components/movies/MovieCard";
import cinemaWallpaper from "@/assets/cinema-wallpaper.jpg";
import { Film } from "lucide-react";
import { toast } from "sonner";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "watchlist", label: "Watchlist" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

const Movies = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("All");

  const fetchMovies = async () => {
    if (!user) return;
    try {
      const data = await getMovies(user.id);
      setMovies(data);
    } catch {
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [user]);

  const handleAdd = async (movie: {
    title: string;
    type: "movie" | "series";
    genre: string;
    status: "watchlist" | "watching" | "watched";
    rating: number | null;
    review: string;
    year: string;
  }) => {
    if (!user) return;
    await createMovie({
      user_id: user.id,
      title: movie.title,
      type: movie.type,
      genre: movie.genre,
      status: movie.status,
      rating: movie.rating,
      review: movie.review,
      poster_url: "",
      year: movie.year,
    });
    await fetchMovies();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = movies.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (genreFilter !== "All" && m.genre !== genreFilter) return false;
    return true;
  });

  const activeGenres = ["All", ...new Set(movies.map((m) => m.genre))];

  return (
    <div className="animate-fade-in relative min-h-full">
      {/* Cinema wallpaper background */}
      <div className="fixed inset-0 -z-10">
        <img src={cinemaWallpaper} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/40 dark:bg-background/80 backdrop-blur-[2px] dark:backdrop-blur-sm" />
      </div>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Movies & Series</h1>
            <p className="text-sm text-muted-foreground">
              {movies.length} title{movies.length !== 1 ? "s" : ""} in your collection
            </p>
          </div>
          <AddMovieForm onAdd={handleAdd} />
        </div>

        {/* Status tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            {statusTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Genre filter */}
        <div className="flex flex-wrap gap-1.5">
          {activeGenres.map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                genreFilter === g
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-card"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Movies grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 backdrop-blur-sm p-16 text-center">
            <Film className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground">No titles yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Click "Add Title" to start building your watchlist.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
