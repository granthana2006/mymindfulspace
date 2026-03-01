import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Pause, Play, SkipForward, SkipBack, Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Cheerful music generator using Web Audio API
const createCheerfulMusic = (ctx: AudioContext) => {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);

  // Cheerful major-key melody (C major happy progression)
  const melody = [
    523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 880, 783.99,
    659.25, 587.33, 523.25, 659.25, 783.99, 1046.5, 880, 783.99,
  ];

  let time = ctx.currentTime;

  // Add a warm pad chord
  [261.63, 329.63, 392].forEach((freq) => {
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.connect(padGain);
    padGain.connect(gain);
    pad.type = "sine";
    pad.frequency.setValueAtTime(freq, time);
    padGain.gain.setValueAtTime(0.06, time);
    padGain.gain.linearRampToValueAtTime(0.06, time + 8);
    padGain.gain.exponentialRampToValueAtTime(0.001, time + 9);
    pad.start(time);
    pad.stop(time + 9);
  });

  // Play melody notes
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.connect(noteGain);
    noteGain.connect(gain);
    osc.type = i % 2 === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, time);
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.25, time + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.start(time);
    osc.stop(time + 0.5);
    time += 0.35;
  });
};

const MonthlyRecap = ({ photos, monthLabel, onBack }: MonthlyRecapProps) => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [songUrl, setSongUrl] = useState("");
  const [showSongInput, setShowSongInput] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % photos.length);
  }, [photos.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [playing, next]);

  // Play cheerful music that loops
  useEffect(() => {
    if (!musicOn || !playing || photos.length === 0 || songUrl) return;

    // Create new cheerful melody every ~6 seconds
    const playMelody = () => {
      try {
        if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        createCheerfulMusic(ctx);
      } catch {}
    };

    playMelody();
    const interval = setInterval(playMelody, 6000);

    return () => {
      clearInterval(interval);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [musicOn, playing, photos.length, songUrl]);

  // Handle user song URL
  useEffect(() => {
    if (!songUrl || !musicOn) {
      if (userAudioRef.current) { userAudioRef.current.pause(); userAudioRef.current = null; }
      return;
    }
    // Stop Web Audio
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }

    const audio = new Audio(songUrl);
    audio.loop = true;
    audio.volume = 0.5;
    if (playing) audio.play().catch(() => {});
    userAudioRef.current = audio;

    return () => { audio.pause(); audio.src = ""; };
  }, [songUrl, musicOn]);

  // Pause/play user audio
  useEffect(() => {
    if (userAudioRef.current) {
      if (playing && musicOn) userAudioRef.current.play().catch(() => {});
      else userAudioRef.current.pause();
    }
  }, [playing, musicOn]);

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
        <Button variant="ghost" size="icon" onClick={() => { setMusicOn((m) => !m); }}>
          {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={prev}><SkipBack className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={next}><SkipForward className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => setShowSongInput((s) => !s)}>
          <Music className="h-4 w-4" />
        </Button>
      </div>

      {showSongInput && (
        <div className="mx-auto max-w-sm space-y-2">
          <p className="text-xs text-center text-muted-foreground">Paste a direct audio link (MP3/WAV) or Spotify embed URL</p>
          <Input
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            placeholder="https://... your favorite song link"
            className="text-sm"
          />
          {songUrl && (
            <button onClick={() => setSongUrl("")} className="text-xs text-destructive hover:underline">Remove custom song</button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {current + 1} of {photos.length} · 🎵 {songUrl ? "Custom song" : "Cheerful music"}: {musicOn ? "on" : "off"}
      </p>
    </div>
  );
};

export default MonthlyRecap;
