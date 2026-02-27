import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Pause, Play, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mood, moodEmojis } from "@/lib/journal-store";
import { format } from "date-fns";

interface RecapPhoto {
  url: string;
  date: string;
  title: string;
  mood: Mood;
}

interface MonthlyRecapProps {
  photos: RecapPhoto[];
  monthLabel: string;
  onBack: () => void;
}

const MonthlyRecap = ({ photos, monthLabel, onBack }: MonthlyRecapProps) => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % photos.length);
  }, [photos.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [playing, next]);

  if (photos.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to calendar</button>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <span className="mb-2 text-4xl">📷</span>
          <p className="text-sm text-muted-foreground">No photos this month. Add photos to your journal entries to create a recap!</p>
        </div>
      </div>
    );
  }

  const photo = photos[current];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to calendar</button>

      <div className="text-center">
        <h2 className="font-serif text-xl font-semibold text-foreground">{monthLabel} Recap</h2>
        <p className="text-sm text-muted-foreground">{photos.length} memories captured</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border" style={{ aspectRatio: "16/9" }}>
        <img
          key={photo.url}
          src={photo.url}
          alt={photo.title}
          className="h-full w-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{moodEmojis[photo.mood]}</span>
            <span className="text-xs text-foreground/70">{format(new Date(photo.date), "MMMM d")}</span>
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground">{photo.title}</h3>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-primary" : "w-1.5 bg-foreground/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={prev}><SkipBack className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={next}><SkipForward className="h-4 w-4" /></Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {current + 1} of {photos.length}
      </p>
    </div>
  );
};

export default MonthlyRecap;
