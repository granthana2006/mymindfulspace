import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wind, Heart, Smile, Star } from "lucide-react";

type Activity = "breathing" | "gratitude" | "mood-checkin" | "mini-game";

const activities: Activity[] = ["breathing", "gratitude", "mood-checkin", "mini-game"];

const gratitudePrompts = [
  "What made you smile today?",
  "Who are you thankful for right now?",
  "What's one small thing that brought you joy?",
  "What's something beautiful you noticed today?",
  "What are you proud of today?",
];

interface OpeningActivityProps {
  onComplete: () => void;
}

const OpeningActivity = ({ onComplete }: OpeningActivityProps) => {
  const [activity] = useState<Activity>(() => activities[Math.floor(Math.random() * activities.length)]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "var(--gradient-heavenly)" }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/20 animate-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full max-w-md text-center">
        {activity === "breathing" && <BreathingExercise onComplete={onComplete} />}
        {activity === "gratitude" && <GratitudePrompt onComplete={onComplete} />}
        {activity === "mood-checkin" && <MoodCheckin onComplete={onComplete} />}
        {activity === "mini-game" && <StarCatcher onComplete={onComplete} />}
      </div>
    </div>
  );
};

// --- Breathing Exercise ---
const BreathingExercise = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const durations = { inhale: 4000, hold: 4000, exhale: 4000 };
    const timer = setTimeout(() => {
      if (phase === "inhale") setPhase("hold");
      else if (phase === "hold") setPhase("exhale");
      else {
        setCycles((c) => c + 1);
        setPhase("inhale");
      }
    }, durations[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => { setCount(0); }, [phase]);

  const circleSize = phase === "inhale" ? "scale-125" : phase === "exhale" ? "scale-75" : "scale-110";

  return (
    <div className="space-y-8">
      <Wind className="mx-auto h-10 w-10 text-primary/60 animate-float" />
      <h2 className="font-serif text-2xl font-semibold text-foreground">Take a breath</h2>
      <div className="flex items-center justify-center">
        <div className={`flex h-40 w-40 items-center justify-center rounded-full border-2 border-primary/30 transition-transform duration-[4000ms] ease-in-out ${circleSize}`} style={{ background: "var(--gradient-dreamy)" }}>
          <span className="font-serif text-xl font-medium text-foreground capitalize">{phase}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Cycle {cycles + 1} of 3</p>
      {cycles >= 2 && (
        <Button onClick={onComplete} className="gap-2 shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4" />
          I'm ready to journal
        </Button>
      )}
      <button onClick={onComplete} className="block mx-auto text-xs text-muted-foreground hover:text-primary transition-colors">
        Skip
      </button>
    </div>
  );
};

// --- Gratitude Prompt ---
const GratitudePrompt = ({ onComplete }: { onComplete: () => void }) => {
  const [prompt] = useState(() => gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]);
  const [answer, setAnswer] = useState("");

  return (
    <div className="space-y-6">
      <Heart className="mx-auto h-10 w-10 text-primary/60 animate-float" />
      <h2 className="font-serif text-2xl font-semibold text-foreground">Gratitude Moment</h2>
      <p className="font-serif text-lg italic text-muted-foreground">"{prompt}"</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Share your thought..."
        className="w-full resize-none rounded-xl border border-border/50 bg-background/50 p-4 font-serif text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        rows={3}
      />
      <Button onClick={onComplete} className="gap-2 shadow-[var(--shadow-glow)]">
        <Sparkles className="h-4 w-4" />
        {answer.trim() ? "Beautiful! Let's journal" : "Skip to journal"}
      </Button>
    </div>
  );
};

// --- Mood Check-in ---
const moods = [
  { emoji: "😌", label: "Calm", color: "hsl(200 70% 50%)" },
  { emoji: "😊", label: "Happy", color: "hsl(45 90% 55%)" },
  { emoji: "🤔", label: "Thoughtful", color: "hsl(270 60% 60%)" },
  { emoji: "😔", label: "Low", color: "hsl(210 30% 50%)" },
  { emoji: "⚡", label: "Energized", color: "hsl(30 90% 55%)" },
  { emoji: "🥰", label: "Loved", color: "hsl(340 70% 60%)" },
];

const MoodCheckin = ({ onComplete }: { onComplete: () => void }) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <Smile className="mx-auto h-10 w-10 text-primary/60 animate-float" />
      <h2 className="font-serif text-2xl font-semibold text-foreground">How's your heart right now?</h2>
      <div className="grid grid-cols-3 gap-3">
        {moods.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-4 transition-all duration-300 hover:scale-105 ${
              selected === i ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]" : "border-border/50 bg-background/30"
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-xs text-foreground">{m.label}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <Button onClick={onComplete} className="gap-2 animate-fade-in shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4" />
          Let's journal
        </Button>
      )}
      <button onClick={onComplete} className="block mx-auto text-xs text-muted-foreground hover:text-primary transition-colors">
        Skip
      </button>
    </div>
  );
};

// --- Star Catcher Mini Game ---
const StarCatcher = ({ onComplete }: { onComplete: () => void }) => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; caught: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const spawnStar = useCallback(() => {
    setStars((prev) => [
      ...prev,
      { id: Date.now(), x: 10 + Math.random() * 80, y: 10 + Math.random() * 70, caught: false },
    ]);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(spawnStar, 800);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [gameStarted, spawnStar]);

  const catchStar = (id: number) => {
    setStars((prev) => prev.map((s) => (s.id === id ? { ...s, caught: true } : s)));
    setScore((s) => s + 1);
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <Star className="mx-auto h-10 w-10 text-primary/60 animate-float" />
        <h2 className="font-serif text-2xl font-semibold text-foreground">Catch the Stars ⭐</h2>
        <p className="text-sm text-muted-foreground">Tap the stars as they appear! A little fun before journaling.</p>
        <Button onClick={() => setGameStarted(true)} className="gap-2 shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4" /> Start!
        </Button>
        <button onClick={onComplete} className="block mx-auto text-xs text-muted-foreground hover:text-primary transition-colors">
          Skip
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-serif text-lg text-foreground">⭐ {score} stars caught!</p>
      <div className="relative mx-auto h-64 w-full overflow-hidden rounded-2xl border border-border/30" style={{ background: "var(--gradient-dreamy)" }}>
        {stars.map((star) =>
          !star.caught ? (
            <button
              key={star.id}
              onClick={() => catchStar(star.id)}
              className="absolute text-2xl transition-all duration-300 hover:scale-150 animate-glow cursor-pointer"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              ⭐
            </button>
          ) : (
            <span key={star.id} className="absolute text-xl opacity-30" style={{ left: `${star.x}%`, top: `${star.y}%` }}>
              ✨
            </span>
          )
        )}
      </div>
      <Button onClick={onComplete} className="gap-2 shadow-[var(--shadow-glow)]">
        <Sparkles className="h-4 w-4" />
        Done! Let's journal ({score} ⭐)
      </Button>
    </div>
  );
};

export default OpeningActivity;
