import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Coffee } from "lucide-react";

const affirmations = [
  "Hey, take care of yourself out there! You're doing great. 💛",
  "See you later! Remember — you're enough, always. 🌟",
  "Catch you soon! Go grab a snack, you deserve it. 🍪",
  "Signing off? Cool. The world's lucky to have you. ✨",
  "Alright, go live your best life! We'll be here when you're back. 🎉",
  "You crushed it today. Take a breather, champ! 💪",
  "Off you go! Remember to hydrate and smile. 💧😊",
  "Later, superstar! Your journal misses you already. 📝",
  "Peace out! Go do something fun. You've earned it. 🎨",
  "Stepping away? Smart move. Balance is everything. ☮️",
  "See ya! Your future self will thank you for today. 🚀",
  "Bye for now! You're braver than you think. 🦋",
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
        <Coffee className="mx-auto mb-4 h-10 w-10 text-primary animate-pulse" />
        <p className="mb-6 font-serif text-lg leading-relaxed text-foreground">{affirmation}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onStay} className="flex-1">
            Stay a while
          </Button>
          <Button onClick={onClose} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            See ya!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClosingAffirmation;
