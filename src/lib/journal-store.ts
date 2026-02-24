export type Mood = "peaceful" | "happy" | "reflective" | "grateful" | "melancholy" | "energetic";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  date: string; // ISO string
  createdAt: string;
}

const STORAGE_KEY = "journal-entries";

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

export function getEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry {
  const entries = getEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return newEntry;
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

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

export function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
