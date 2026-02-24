import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, Sparkles, LogOut, Moon, BarChart2, Cloud } from "lucide-react";
import { getEntries, getGreeting, getRandomQuote, deleteEntry, JournalEntry } from "@/lib/journal-store";
import JournalEntryCard from "@/components/JournalEntryCard";
import NewEntryForm from "@/components/NewEntryForm";
import EntryDetail from "@/components/EntryDetail";
import OpeningActivity from "@/components/OpeningActivity";
import ClosingAffirmation from "@/components/ClosingAffirmation";
import MoodChart from "@/components/MoodChart";
import PositiveQuote from "@/components/PositiveQuote";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

type View = "activity" | "list" | "new" | "detail" | "chart";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<View>("activity");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [quote] = useState(getRandomQuote);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    const data = await getEntries();
    setEntries(data);
    setLoadingEntries(false);
  }, []);

  useEffect(() => {
    if (user) loadEntries();
  }, [user, loadEntries]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--gradient-heavenly)" }}>
        <div className="animate-float text-6xl">✨</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    await loadEntries();
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setView("detail");
  };

  const handleSignOut = () => {
    setShowAffirmation(true);
  };

  if (view === "activity") {
    return <OpeningActivity onComplete={() => setView("list")} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-heavenly)" }}>
      {showAffirmation && (
        <ClosingAffirmation
          onClose={() => signOut()}
          onStay={() => setShowAffirmation(false)}
        />
      )}

      {/* Glitter particles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/15 animate-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 flex flex-col items-center px-4 pb-10 pt-8 text-center md:pb-14 md:pt-16">
          {/* Top bar */}
          <div className="mb-6 flex w-full max-w-2xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary-foreground/60" />
              <span className="text-sm text-primary-foreground/60">Soul Journal</span>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>

          <div className="mb-2 animate-float">
            <Sparkles className="h-7 w-7 text-primary-foreground/80" />
          </div>
          <h1 className="mb-1 font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
            {getGreeting()}
          </h1>
          <p className="max-w-md font-serif text-sm italic text-primary-foreground/60">"{quote}"</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-6">
        {/* Positive quote */}
        <div className="mb-6">
          <PositiveQuote />
        </div>

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
          <div className="animate-fade-in space-y-4">
            <button onClick={() => setView("list")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to journal
            </button>
            <MoodChart entries={entries.map((e) => ({ date: e.date, mood: e.mood }))} />
          </div>
        )}

        {view === "list" && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">Your Journal</h2>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {entries.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("chart")}
                  className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Mood</span>
                </button>
                <button
                  onClick={() => setView("new")}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  New Entry
                </button>
              </div>
            </div>

            {loadingEntries ? (
              <div className="flex justify-center py-12"><div className="animate-float text-4xl">🌙</div></div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center" style={{ background: "var(--gradient-dreamy)" }}>
                <div className="mb-4 animate-float text-5xl">🌙</div>
                <h3 className="mb-1 font-serif text-lg font-semibold text-foreground">Your journal awaits</h3>
                <p className="mb-6 max-w-xs text-sm text-muted-foreground">Start capturing your thoughts, feelings, and moments that matter.</p>
                <button
                  onClick={() => setView("new")}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105"
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
    </div>
  );
};

export default Index;
