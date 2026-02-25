import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Camera, ImagePlus } from "lucide-react";
import StarRating from "./StarRating";
import { GENRES } from "@/lib/book-store";
import { toast } from "sonner";

interface AddBookFormProps {
  onAdd: (book: {
    title: string;
    author: string;
    genre: string;
    status: "tbr" | "reading" | "read";
    rating: number | null;
    description: string;
    photoFile: File | null;
  }) => Promise<void>;
}

const AddBookForm = ({ onAdd }: AddBookFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [status, setStatus] = useState<"tbr" | "reading" | "read">("tbr");
  const [rating, setRating] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setTitle(""); setAuthor(""); setGenre("Fiction"); setStatus("tbr");
    setRating(0); setDescription(""); setPhotoFile(null); setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      await onAdd({ title, author, genre, status, rating: rating || null, description, photoFile });
      reset();
      setOpen(false);
      toast.success("Book added!");
    } catch {
      toast.error("Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Add a Book</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Photo */}
          <div>
            <Label>Book Photo</Label>
            <div className="mt-1 flex items-center gap-2">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-24 w-20 rounded-lg object-cover border border-border" />
              ) : (
                <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                  <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                  <ImagePlus className="h-3.5 w-3.5" /> Gallery
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Camera
                </Button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </div>

          <div>
            <Label htmlFor="book-title">Title *</Label>
            <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" />
          </div>
          <div>
            <Label htmlFor="book-author">Author</Label>
            <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENRES.filter(g => g !== "All").map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "tbr" | "reading" | "read")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tbr">To Be Read</SelectItem>
                  <SelectItem value="reading">Currently Reading</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "read" && (
            <div>
              <Label>Your Rating</Label>
              <StarRating rating={rating} onChange={setRating} />
            </div>
          )}

          <div>
            <Label htmlFor="book-desc">Your Thoughts</Label>
            <Textarea
              id="book-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you like? Any suspicions if it's a thriller? Short review..."
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Book"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookForm;
