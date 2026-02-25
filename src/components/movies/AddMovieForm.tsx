import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { MOVIE_GENRES } from "@/lib/movie-store";
import StarRating from "@/components/books/StarRating";
import { toast } from "sonner";

interface AddMovieFormProps {
  onAdd: (movie: {
    title: string;
    type: "movie" | "series";
    genre: string;
    status: "watchlist" | "watching" | "watched";
    rating: number | null;
    review: string;
    year: string;
  }) => Promise<void>;
}

const AddMovieForm = ({ onAdd }: AddMovieFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"movie" | "series">("movie");
  const [genre, setGenre] = useState("Action");
  const [status, setStatus] = useState<"watchlist" | "watching" | "watched">("watchlist");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [year, setYear] = useState("");

  const reset = () => {
    setTitle(""); setType("movie"); setGenre("Action"); setStatus("watchlist");
    setRating(0); setReview(""); setYear("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      await onAdd({ title, type, genre, status, rating: rating || null, review, year });
      reset();
      setOpen(false);
      toast.success("Added!");
    } catch {
      toast.error("Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Title
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Add Movie / Series</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="movie-title">Title *</Label>
            <Input id="movie-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie or series name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "movie" | "series")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOVIE_GENRES.filter(g => g !== "All").map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "watchlist" | "watching" | "watched")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="watchlist">Watchlist</SelectItem>
                  <SelectItem value="watching">Watching</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "watched" && (
            <div>
              <Label>Your Rating</Label>
              <StarRating rating={rating} onChange={setRating} />
            </div>
          )}

          <div>
            <Label htmlFor="movie-review">Your Review</Label>
            <Textarea
              id="movie-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think? Worth rewatching?"
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add to Collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieForm;
