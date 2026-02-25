import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";

const affirmations = [
  "You survived today, and that is beautiful. You are enough. 💛",
  "Every breath you took today was a gift. Rest well, brave soul. 🌙",
  "You showed up today. That takes courage. Be proud. ✨",
  "The universe is lucky to have you in it. Goodnight, wonderful one. 🌟",
  "Today is done, and you made it through. Tomorrow is a new canvas. 🎨",
  "You are stronger than you know. Sleep peacefully tonight. 💫",
  "Your heart kept beating all day — for you. How magical is that? 🫶",
  "The stars shine brighter because you exist. Sweet dreams. ⭐",
  "Gratitude to the universe for this beautiful day and this wealthy, abundant life. 🙏",
  "You are a miracle walking — never forget that. The world is better because of you. 🌈",
  "Thank you, universe, for every breath, every lesson, every moment of grace today. 🌸",
  "You made it through another beautiful day. Be grateful. Be proud. Be at peace. ☮️",
];

interface ClosingAffirmationProps {
  onClose: () => void;
  onStay: () => void;
}

const ClosingAffirmation = ({ onClose, onStay }: ClosingAffirmationProps) => {
  const [affirmation] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-foreground/40 backdrop-blur-md">
      <div
        className={`w-full max-w-sm rounded-2xl border border-border/30 bg-card p-8 text-center shadow-[var(--shadow-glow)] transition-all duration-700 ${
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <Heart className="mx-auto mb-4 h-10 w-10 text-primary animate-pulse" />
        <p className="mb-6 font-serif text-lg leading-relaxed text-foreground">{affirmation}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onStay} className="flex-1">
            Stay a while
          </Button>
          <Button onClick={onClose} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            Goodnight
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClosingAffirmation;
