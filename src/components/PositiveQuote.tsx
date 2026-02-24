import { Sparkles } from "lucide-react";

const positiveQuotes = [
  "You woke up today. That's your superpower. 🌅",
  "This moment right now? It's yours. Own it. ✨",
  "The fact that you're here means you're winning. 🏆",
  "Your story is still being written, and it's beautiful. 📖",
  "Today has never existed before. Make it magic. 🪄",
  "You carry sunshine inside you. Let it glow. ☀️",
  "Every heartbeat is the universe cheering for you. 💓",
  "You are a masterpiece in progress. Keep creating. 🎨",
  "The world needs your kind of light. Shine on. 🌟",
  "Breathe in possibility. Breathe out doubt. 🌬️",
];

const PositiveQuote = () => {
  const quote = positiveQuotes[Math.floor(Math.random() * positiveQuotes.length)];
  
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 p-4" style={{ background: "var(--gradient-dreamy)" }}>
      <Sparkles className="h-5 w-5 shrink-0 text-primary animate-glow" />
      <p className="font-serif text-sm italic text-foreground/80">{quote}</p>
    </div>
  );
};

export default PositiveQuote;
