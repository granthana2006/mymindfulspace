import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

const StarRating = ({ rating, onChange, size = "md" }: StarRatingProps) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className="disabled:cursor-default"
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= rating
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
