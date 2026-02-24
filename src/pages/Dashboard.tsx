import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Film,
  GraduationCap,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getGreeting } from "@/lib/journal-store";

const corners = [
  {
    label: "Journal",
    description: "Capture thoughts, moods & reflections",
    path: "/journal",
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Planner",
    description: "To-dos, daily, weekly & monthly plans",
    path: "/planner",
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-accent text-accent-foreground",
  },
  {
    label: "Books",
    description: "TBR list & reading log",
    path: "/books",
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Movies & Series",
    description: "Watchlist & watched log",
    path: "/movies",
    icon: <Film className="h-6 w-6" />,
    color: "bg-accent text-accent-foreground",
  },
  {
    label: "College",
    description: "Track assignments & supplements",
    path: "/college",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Personal Space",
    description: "Sleep, water & wellness tracking",
    path: "/personal",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-accent text-accent-foreground",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">{getGreeting()}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          What would you like to focus on today?
        </p>
      </div>

      {/* Corner cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {corners.map((corner) => (
          <Link
            key={corner.path}
            to={corner.path}
            className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`mb-4 inline-flex rounded-lg p-2.5 ${corner.color}`}>
              {corner.icon}
            </div>
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {corner.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {corner.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
