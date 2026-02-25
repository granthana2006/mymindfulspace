import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Book, getBooks, createBook, deleteBook, uploadBookPhoto, GENRES } from "@/lib/book-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddBookForm from "@/components/books/AddBookForm";
import BookCard from "@/components/books/BookCard";
import libraryWallpaper from "@/assets/library-wallpaper.jpg";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "tbr", label: "TBR" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
];

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("All");

  const fetchBooks = async () => {
    if (!user) return;
    try {
      const data = await getBooks(user.id);
      setBooks(data);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user]);

  const handleAdd = async (book: {
    title: string;
    author: string;
    genre: string;
    status: "tbr" | "reading" | "read";
    rating: number | null;
    description: string;
    photoFile: File | null;
  }) => {
    if (!user) return;
    let photo_url = "";
    if (book.photoFile) {
      photo_url = await uploadBookPhoto(user.id, book.photoFile);
    }
    await createBook({
      user_id: user.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      status: book.status,
      rating: book.rating,
      description: book.description,
      photo_url,
    });
    await fetchBooks();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Book removed");
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const filtered = books.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (genreFilter !== "All" && b.genre !== genreFilter) return false;
    return true;
  });

  // Get genres that actually have books for the filter
  const activeGenres = ["All", ...new Set(books.map((b) => b.genre))];

  return (
    <div className="animate-fade-in relative min-h-full">
      {/* Library wallpaper background */}
      <div className="fixed inset-0 -z-10">
        <img src={libraryWallpaper} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Book Corner</h1>
            <p className="text-sm text-muted-foreground">
              {books.length} book{books.length !== 1 ? "s" : ""} in your library
            </p>
          </div>
          <AddBookForm onAdd={handleAdd} />
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

        {/* Books grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 backdrop-blur-sm p-16 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground">No books yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Click "Add Book" to start building your personal library.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
