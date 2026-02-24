import { JournalEntry, moodEmojis, moodLabels } from "@/lib/journal-store";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface JournalEntryCardProps {
  entry: JournalEntry;
  index: number;
  onDelete: (id: string) => void;
  onClick: (entry: JournalEntry) => void;
}

const JournalEntryCard = ({ entry, index, onDelete, onClick }: JournalEntryCardProps) => {
  return (
    <div
      className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onClick(entry)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{moodEmojis[entry.mood]}</span>
            <span className="text-xs text-muted-foreground">{moodLabels[entry.mood]}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.date), "MMM d, yyyy")}
            </span>
          </div>
          <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">{entry.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{entry.content}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          className="ml-3 rounded-md p-1.5 text-muted opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default JournalEntryCard;
