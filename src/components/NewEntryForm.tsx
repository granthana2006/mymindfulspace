import { useState } from "react";
import { Mood, saveEntry } from "@/lib/journal-store";
import MoodPicker from "./MoodPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, X } from "lucide-react";

interface NewEntryFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const NewEntryForm = ({ onSave, onCancel }: NewEntryFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !mood) return;

    setSaving(true);
    await saveEntry({
      title: title.trim(),
      content: content.trim(),
      mood,
      date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    onSave();
  };

  const isValid = title.trim() && content.trim() && mood;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">New Entry</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">How are you feeling?</label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <div>
        <Input placeholder="Give this moment a title..." value={title} onChange={(e) => setTitle(e.target.value)} className="border-border/50 bg-card/50 font-serif text-lg placeholder:text-muted" />
      </div>

      <div>
        <Textarea placeholder="Let your thoughts flow freely... What's on your mind tonight?" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px] resize-none border-border/50 bg-card/50 font-serif text-base leading-relaxed placeholder:text-muted" />
      </div>

      <Button type="submit" disabled={!isValid || saving} className="w-full gap-2 shadow-[var(--shadow-glow)] transition-all duration-300">
        <Send className="h-4 w-4" />
        {saving ? "Saving..." : "Save Entry"}
      </Button>
    </form>
  );
};

export default NewEntryForm;
