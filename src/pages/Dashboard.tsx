import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Film,
  GraduationCap,
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getGreeting, getEntries, JournalEntry, moodEmojis } from "@/lib/journal-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";

const corners = [
  { label: "Journal", description: "Thoughts & reflections", path: "/journal", icon: <BookOpen className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Planner", description: "To-dos & plans", path: "/planner", icon: <Calendar className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "Books", description: "TBR & reading log", path: "/books", icon: <BookOpen className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Movies & Series", description: "Watchlist & reviews", path: "/movies", icon: <Film className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "College", description: "Academics & schedule", path: "/college", icon: <GraduationCap className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Personal Space", description: "Wellness tracking", path: "/personal", icon: <Heart className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const [todayTasks, setTodayTasks] = useState<{ total: number; done: number }>({ total: 0, done: 0 });
  const [recentMood, setRecentMood] = useState<{ mood: string; date: string } | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<{ subject: string; days: number }[]>([]);
  const [readingStats, setReadingStats] = useState<{ reading: number; completed: number; tbr: number }>({ reading: 0, completed: 0, tbr: 0 });
  const [wellnessToday, setWellnessToday] = useState<Record<string, number> | null>(null);

  const loadOverview = useCallback(async () => {
    if (!user) return;

    // Tasks for today
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: tasks } = await supabase.from("tasks").select("completed, due_date").eq("user_id", user.id);
    if (tasks) {
      const todayTasks = tasks.filter((t) => t.due_date === todayStr);
      setTodayTasks({ total: todayTasks.length, done: todayTasks.filter((t) => t.completed).length });
    }

    // Recent journal mood
    const { data: journals } = await supabase.from("journal_entries").select("mood, date").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
    if (journals?.[0]) setRecentMood({ mood: journals[0].mood, date: journals[0].date });

    // Upcoming exams
    const { data: exams } = await supabase.from("exams").select("subject, exam_date").eq("user_id", user.id);
    if (exams) {
      const upcoming = exams
        .filter((e) => !isPast(new Date(e.exam_date)))
        .map((e) => ({ subject: e.subject, days: Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 3);
      setUpcomingExams(upcoming);
    }

    // Books
    const { data: books } = await supabase.from("books").select("status").eq("user_id", user.id);
    if (books) {
      setReadingStats({
        reading: books.filter((b) => b.status === "reading").length,
        completed: books.filter((b) => b.status === "completed").length,
        tbr: books.filter((b) => b.status === "tbr").length,
      });
    }

    // Wellness (from localStorage)
    const stored = localStorage.getItem(`wellness-v2-${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = parsed.find((l: any) => l.date === todayStr);
      if (today) setWellnessToday(today.values);
    }
  }, [user]);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const taskPercent = todayTasks.total > 0 ? Math.round((todayTasks.done / todayTasks.total) * 100) : 0;

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
        <p className="mt-1 text-muted-foreground">Here's your day at a glance</p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's tasks */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Today's Tasks</span>
            </div>
            {todayTasks.total > 0 ? (
              <>
                <p className="text-2xl font-bold text-foreground">{todayTasks.done}/{todayTasks.total}</p>
                <Progress value={taskPercent} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">{taskPercent}% completed</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks for today</p>
            )}
          </CardContent>
        </Card>

        {/* Recent mood */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Last Mood</span>
            </div>
            {recentMood ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl">{moodEmojis[recentMood.mood as keyof typeof moodEmojis] || "✨"}</span>
                <div>
                  <p className="text-sm font-medium capitalize text-foreground">{recentMood.mood}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(recentMood.date), "MMM d")}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No entries yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming exam */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Next Exam</span>
            </div>
            {upcomingExams.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-foreground">{upcomingExams[0].subject}</p>
                <Badge variant={upcomingExams[0].days <= 3 ? "destructive" : "secondary"} className="mt-1 text-xs">
                  {upcomingExams[0].days} day{upcomingExams[0].days !== 1 ? "s" : ""} left
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming exams</p>
            )}
          </CardContent>
        </Card>

        {/* Reading */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Reading</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{readingStats.reading}</p>
                <p className="text-muted-foreground">Reading</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{readingStats.completed}</p>
                <p className="text-muted-foreground">Done</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{readingStats.tbr}</p>
                <p className="text-muted-foreground">TBR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness quick stats */}
      {wellnessToday && (
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Today's Wellness</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {wellnessToday.water !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span>💧</span> <span className="font-medium text-foreground">{wellnessToday.water}</span> <span className="text-muted-foreground">water</span>
                </div>
              )}
              {wellnessToday.sleep !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span>🌙</span> <span className="font-medium text-foreground">{wellnessToday.sleep}h</span> <span className="text-muted-foreground">sleep</span>
                </div>
              )}
              {wellnessToday.mood !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span>😊</span> <span className="font-medium text-foreground">{wellnessToday.mood}/10</span> <span className="text-muted-foreground">mood</span>
                </div>
              )}
              {wellnessToday.exercise !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span>🏋️</span> <span className="font-medium text-foreground">{wellnessToday.exercise}m</span> <span className="text-muted-foreground">exercise</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
