import { BookOpen } from "lucide-react";

const Books = () => (
  <div className="animate-fade-in space-y-6">
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Book Corner</h1>
      <p className="text-muted-foreground">Your TBR list & reading journal</p>
    </div>
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
      <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="font-semibold text-foreground">Coming Soon</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Your personal library with TBR lists and reading logs — complete with a beautiful library wallpaper.
      </p>
    </div>
  </div>
);

export default Books;
