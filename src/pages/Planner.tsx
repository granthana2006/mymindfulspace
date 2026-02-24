import { Calendar } from "lucide-react";

const Planner = () => (
  <div className="animate-fade-in space-y-6">
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Planner</h1>
      <p className="text-muted-foreground">To-do lists, daily, weekly & monthly plans</p>
    </div>
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
      <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="font-semibold text-foreground">Coming Soon</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Your planner with to-do lists, task reminders, and daily/weekly/monthly views is being built.
      </p>
    </div>
  </div>
);

export default Planner;
