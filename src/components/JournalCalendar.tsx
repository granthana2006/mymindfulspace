import { useMemo, useState } from "react";
import { JournalEntry, moodEmojis } from "@/lib/journal-store";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import MonthlyRecap from "./MonthlyRecap";

interface JournalCalendarProps {
  entries: JournalEntry[];
  onBack: () => void;
}

const JournalCalendar = ({ entries, onBack }: JournalCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecap, setShowRecap] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const padStart = (startDay + 6) % 7;

  const entriesByDate = useMemo(() => {
    const map: Record<string, JournalEntry> = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = e;
    });
    return map;
  }, [entries]);

  const monthKey = format(currentMonth, "yyyy-MM");
  const monthEntries = entries.filter((e) => e.date.startsWith(monthKey));
  const monthPhotos = monthEntries.filter((e) => e.photo_url).map((e) => ({ url: e.photo_url, date: e.date, title: e.title, mood: e.mood }));

  if (showRecap) {
    return <MonthlyRecap photos={monthPhotos} monthLabel={format(currentMonth, "MMMM yyyy")} onBack={() => setShowRecap(false)} />;
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to journal
      </button>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-foreground">Photo Calendar</h2>
        <div className="flex items-center gap-2">
          {monthPhotos.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowRecap(true)}>
              <Play className="h-3.5 w-3.5" />
              Monthly Recap
            </Button>
          )}
          <button onClick={() => setCurrentMonth((d) => subMonths(d, 1))} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={() => setCurrentMonth((d) => addMonths(d, 1))} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: padStart }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square rounded-lg" />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const entry = entriesByDate[dateStr];
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={dateStr}
              className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
                isToday ? "border-primary ring-1 ring-primary/30" : "border-border"
              } ${entry?.photo_url ? "" : "bg-card"}`}
            >
              {entry?.photo_url ? (
                <>
                  <img src={entry.photo_url} alt={entry.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <span className="absolute bottom-0.5 left-1 text-[10px] font-medium text-foreground">{format(day, "d")}</span>
                  <span className="absolute right-0.5 top-0.5 text-xs">{moodEmojis[entry.mood]}</span>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{format(day, "d")}</span>
                  {entry && <span className="text-xs mt-0.5">{moodEmojis[entry.mood]}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JournalCalendar;
