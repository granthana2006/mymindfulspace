import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, BarChart2 } from "lucide-react";
import { getEntries, deleteEntry, JournalEntry } from "@/lib/journal-store";
import JournalEntryCard from "@/components/JournalEntryCard";
import NewEntryForm from "@/components/NewEntryForm";
import EntryDetail from "@/components/EntryDetail";
import MoodChart from "@/components/MoodChart";
import PositiveQuote from "@/components/PositiveQuote";

type View = "list" | "new" | "detail" | "chart";

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    const data = await getEntries();
    setEntries(data);
    setLoadingEntries(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    await loadEntries();
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setView("detail");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Journal</h1>
        <p className="text-muted-foreground">Capture your thoughts, moods & reflections</p>
      </div>

      {/* Positive quote */}
      <PositiveQuote />

      {view === "new" && (
        <NewEntryForm
          onSave={async () => {
            await loadEntries();
            setView("list");
          }}
          onCancel={() => setView("list")}
        />
      )}

      {view === "detail" && selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onBack={() => {
            setSelectedEntry(null);
            setView("list");
          }}
        />
      )}

      {view === "chart" && (
        <div className="space-y-4">
          <button onClick={() => setView("list")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to journal
          </button>
          <MoodChart entries={entries.map((e) => ({ date: e.date, mood: e.mood }))} />
        </div>
      )}

      {view === "list" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Your Entries</h2>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {entries.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("chart")}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Mood</span>
              </button>
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Entry
              </button>
            </div>
          </div>

          {loadingEntries ? (
            <div className="flex justify-center py-12"><div className="animate-float text-4xl">✍️</div></div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <div className="mb-4 text-5xl">📝</div>
              <h3 className="font-semibold text-foreground">Your journal awaits</h3>
              <p className="mb-6 max-w-xs text-sm text-muted-foreground">Start capturing your thoughts, feelings, and moments that matter.</p>
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Write your first entry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <JournalEntryCard key={entry.id} entry={entry} index={i} onDelete={handleDelete} onClick={handleEntryClick} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Journal;
