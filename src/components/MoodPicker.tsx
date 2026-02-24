import { Mood, moodEmojis, moodLabels } from "@/lib/journal-store";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const moods: Mood[] = ["peaceful", "happy", "reflective", "grateful", "melancholy", "energetic"];

const MoodPicker = ({ value, onChange }: MoodPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-all duration-300 hover:scale-105",
            value === mood
              ? "border-primary bg-primary/10 text-foreground shadow-[var(--shadow-glow)]"
              : "bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent"
          )}
        >
          <span className="text-lg">{moodEmojis[mood]}</span>
          <span>{moodLabels[mood]}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodPicker;
