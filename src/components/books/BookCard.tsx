import { Book } from "@/lib/book-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen } from "lucide-react";
import StarRating from "./StarRating";

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
}

const statusLabel: Record<string, string> = {
  tbr: "TBR",
  reading: "Reading",
  read: "Read",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  tbr: "outline",
  reading: "secondary",
  read: "default",
};

const BookCard = ({ book, onDelete }: BookCardProps) => {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-[var(--shadow-card)]">
      <CardContent className="flex gap-3 p-3">
        {/* Photo / placeholder */}
        {book.photo_url ? (
          <img
            src={book.photo_url}
            alt={book.title}
            className="h-28 w-20 shrink-0 rounded-lg object-cover border border-border/30"
          />
        ) : (
          <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/20">
            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-sm font-semibold text-foreground">{book.title}</h3>
              {book.author && <p className="truncate text-xs text-muted-foreground">{book.author}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => onDelete(book.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant[book.status]} className="text-[10px] px-1.5 py-0">
              {statusLabel[book.status]}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {book.genre}
            </Badge>
          </div>

          {book.status === "read" && book.rating && (
            <div className="mt-1">
              <StarRating rating={book.rating} size="sm" />
            </div>
          )}

          {book.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
