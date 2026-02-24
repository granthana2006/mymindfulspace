import { GraduationCap } from "lucide-react";

const College = () => (
  <div className="animate-fade-in space-y-6">
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">College Corner</h1>
      <p className="text-muted-foreground">Track assignments, supplements & college life</p>
    </div>
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
      <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="font-semibold text-foreground">Coming Soon</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Keep track of everything happening in college — assignments, supplements, and more.
      </p>
    </div>
  </div>
);

export default College;
