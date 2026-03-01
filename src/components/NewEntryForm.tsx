import { useState } from "react";
import { Mood, saveEntry, uploadJournalPhoto, getHappySaveQuote } from "@/lib/journal-store";
import MoodPicker from "./MoodPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Send, X, Camera, ImagePlus } from "lucide-react";

interface NewEntryFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const NewEntryForm = ({ onSave, onCancel }: NewEntryFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showSaveQuote, setShowSaveQuote] = useState(false);
  const [saveQuote, setSaveQuote] = useState("");
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [entryTime, setEntryTime] = useState(
    // Default to current IST time
    new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !mood) return;

    setSaving(true);
    let photoUrl = "";
    if (photo) {
      const url = await uploadJournalPhoto(photo);
      if (url) photoUrl = url;
    }

    await saveEntry({
      title: title.trim(),
      content: content.trim(),
      mood,
      date: entryDate,
      photo_url: photoUrl,
    });

    setSaving(false);
    setSaveQuote(getHappySaveQuote());
    setShowSaveQuote(true);
  };

  const handleQuoteDismiss = () => {
    setShowSaveQuote(false);
    onSave();
  };

  const isValid = title.trim() && content.trim() && mood;

  // Format the IST time display
  const istDisplay = (() => {
    try {
      const [h, m] = entryTime.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, "0")} ${period} IST`;
    } catch {
      return entryTime;
    }
  })();

  if (showSaveQuote) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center space-y-6 rounded-xl border border-primary/20 p-10 text-center" style={{ background: "var(--gradient-glass)", backdropFilter: "blur(10px)" }}>
        <div className="text-5xl">🎉</div>
        <p className="font-serif text-xl font-medium text-foreground">{saveQuote}</p>
        <Button onClick={handleQuoteDismiss} className="gap-2">
          Continue ✨
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">New Entry</h2>
          <p className="text-sm text-muted-foreground">{istDisplay}</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Date & Time pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </div>
        <div>
          <Label>Time (IST)</Label>
          <Input type="time" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">How are you feeling?</label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <div>
        <Input placeholder="Give this moment a title..." value={title} onChange={(e) => setTitle(e.target.value)} className="border-border/50 bg-card/50 font-serif text-lg placeholder:text-muted" />
      </div>

      <div>
        <Textarea placeholder="Let your thoughts flow freely... What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px] resize-none border-border/50 bg-card/50 font-serif text-base leading-relaxed placeholder:text-muted" />
      </div>

      {/* Photo upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Photo of the day</label>
        <div className="flex gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ImagePlus className="h-4 w-4" />
            Gallery
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Camera className="h-4 w-4" />
            Camera
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
        {photoPreview && (
          <div className="relative mt-3">
            <img src={photoPreview} alt="Preview" className="h-48 w-full rounded-lg object-cover border border-border/50" />
            <button
              type="button"
              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={!isValid || saving} className="w-full gap-2 shadow-[var(--shadow-glow)] transition-all duration-300">
        <Send className="h-4 w-4" />
        {saving ? "Saving..." : "Save Entry"}
      </Button>
    </form>
  );
};

export default NewEntryForm;
