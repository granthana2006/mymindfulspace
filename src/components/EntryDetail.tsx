import { JournalEntry, moodEmojis, moodLabels } from "@/lib/journal-store";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface EntryDetailProps {
  entry: JournalEntry;
  onBack: () => void;
}

const EntryDetail = ({ entry, onBack }: EntryDetailProps) => {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to journal
      </button>

      <div className="rounded-xl border border-border/50 p-6 shadow-[var(--shadow-dreamy)] md:p-8" style={{ background: "var(--gradient-glass)", backdropFilter: "blur(10px)" }}>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">{moodEmojis[entry.mood]}</span>
          <div>
            <span className="text-sm font-medium text-accent-foreground">{moodLabels[entry.mood]}</span>
            <p className="text-xs text-muted-foreground">
              {format(new Date(entry.date), "EEEE, MMMM d, yyyy · h:mm a")}
            </p>
          </div>
        </div>

        <h1 className="mb-6 font-serif text-3xl font-bold text-foreground">{entry.title}</h1>

        {entry.photo_url && (
          <div className="mb-6 overflow-hidden rounded-xl border border-border/30">
            <img src={entry.photo_url} alt="Day's photo" className="w-full max-h-[400px] object-cover" />
          </div>
        )}

        <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground/90">
          {entry.content}
        </div>
      </div>
    </div>
  );
};

export default EntryDetail;
