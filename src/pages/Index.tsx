import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { getEntries, getGreeting, getRandomQuote, deleteEntry, JournalEntry } from "@/lib/journal-store";
import JournalEntryCard from "@/components/JournalEntryCard";
import NewEntryForm from "@/components/NewEntryForm";
import EntryDetail from "@/components/EntryDetail";
import heroBg from "@/assets/hero-bg.jpg";

type View = "list" | "new" | "detail";

const Index = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [quote] = useState(getRandomQuote);

  const loadEntries = useCallback(() => {
    setEntries(getEntries());
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    loadEntries();
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 flex flex-col items-center px-4 pb-12 pt-16 text-center md:pb-16 md:pt-24">
          <div className="mb-3 animate-float">
            <Sparkles className="h-8 w-8 text-primary-foreground/80" />
          </div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            {getGreeting()}
          </h1>
          <p className="max-w-md font-serif text-base italic text-primary-foreground/70">
            "{quote}"
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {view === "new" && (
          <NewEntryForm
            onSave={() => {
              loadEntries();
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

        {view === "list" && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">Your Journal</h2>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {entries.length}
                </span>
              </div>
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                New Entry
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <div className="mb-4 animate-float text-5xl">🌙</div>
                <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">
                  Your journal awaits
                </h3>
                <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                  Start capturing your thoughts, feelings, and moments that matter.
                </p>
                <button
                  onClick={() => setView("new")}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Write your first entry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onDelete={handleDelete}
                    onClick={handleEntryClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
