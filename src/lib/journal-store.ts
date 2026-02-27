import { supabase } from "@/integrations/supabase/client";

export type Mood = "peaceful" | "happy" | "reflective" | "grateful" | "melancholy" | "energetic";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  date: string;
  photo_url: string;
  created_at: string;
}

export const moodEmojis: Record<Mood, string> = {
  peaceful: "🌊",
  happy: "✨",
  reflective: "🌙",
  grateful: "🙏",
  melancholy: "🌧️",
  energetic: "⚡",
};

export const moodLabels: Record<Mood, string> = {
  peaceful: "Peaceful",
  happy: "Happy",
  reflective: "Reflective",
  grateful: "Grateful",
  melancholy: "Melancholy",
  energetic: "Energetic",
};

export async function getEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, title, content, mood, date, photo_url, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
  return (data || []) as JournalEntry[];
}

export async function saveEntry(entry: { title: string; content: string; mood: Mood; date: string; photo_url?: string }): Promise<JournalEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      date: entry.date,
      photo_url: entry.photo_url || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving entry:", error);
    return null;
  }
  return data as JournalEntry;
}

export async function uploadJournalPhoto(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("journal-photos")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Error uploading photo:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("journal-photos")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) console.error("Error deleting entry:", error);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function getRandomQuote(): string {
  const quotes = [
    "The quieter you become, the more you can hear.",
    "In the middle of difficulty lies opportunity.",
    "Write it on your heart that every day is the best day in the year.",
    "Be yourself; everyone else is already taken.",
    "The only way to do great work is to love what you do.",
    "Stars can't shine without darkness.",
    "Breathe in peace, breathe out stress.",
    "Today is a beautiful day to be alive.",
    "Let your thoughts flow like water.",
    "Every sunset brings the promise of a new dawn.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getHappySaveQuote(): string {
  const quotes = [
    "Beautiful entry! 🌟 Your thoughts are safe with us.",
    "Saved! ✨ Thank you for sharing your heart today.",
    "What a lovely reflection! 📝 Keep shining.",
    "Entry saved! 🌈 Every word matters.",
    "Captured! 💫 This moment is now a beautiful memory.",
    "Beautifully written! 🦋 Your journal grows richer.",
    "Saved with love! 💖 You're doing something wonderful for yourself.",
    "Another beautiful page in your story! 📖",
    "Your words have power! ⚡ Entry saved.",
    "This is growth! 🌱 Keep journaling, keep blooming.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
