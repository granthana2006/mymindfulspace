import { Movie } from "@/lib/movie-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Film, Tv } from "lucide-react";
import StarRating from "@/components/books/StarRating";

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
}

const statusLabel: Record<string, string> = {
  watchlist: "Watchlist",
  watching: "Watching",
  watched: "Watched",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  watchlist: "outline",
  watching: "secondary",
  watched: "default",
};

const MovieCard = ({ movie, onDelete }: MovieCardProps) => {
  const Icon = movie.type === "series" ? Tv : Film;

  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-[var(--shadow-card)]">
      <CardContent className="flex gap-3 p-3">
        <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/20">
          <Icon className="h-6 w-6 text-muted-foreground/30" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-sm font-semibold text-foreground">{movie.title}</h3>
              {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onDelete(movie.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant[movie.status]} className="text-[10px] px-1.5 py-0">
              {statusLabel[movie.status]}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {movie.genre}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
              {movie.type}
            </Badge>
          </div>

          {movie.status === "watched" && movie.rating && (
            <div className="mt-1">
              <StarRating rating={movie.rating} size="sm" />
            </div>
          )}

          {movie.review && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {movie.review}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
