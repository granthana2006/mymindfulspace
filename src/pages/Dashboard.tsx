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
  Wallet,
  Dumbbell,
  Target,
  Trophy,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getGreeting, moodEmojis } from "@/lib/journal-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, subDays } from "date-fns";

const corners = [
  { label: "Journal", description: "Thoughts & reflections", path: "/journal", icon: <BookOpen className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Planner", description: "To-dos & plans", path: "/planner", icon: <Calendar className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "Books", description: "TBR & reading log", path: "/books", icon: <BookOpen className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Movies & Series", description: "Watchlist & reviews", path: "/movies", icon: <Film className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "College", description: "Academics & schedule", path: "/college", icon: <GraduationCap className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Finance", description: "Income & expenses", path: "/finance", icon: <Wallet className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "Fitness", description: "Workouts & nutrition", path: "/fitness", icon: <Dumbbell className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
  { label: "Habits", description: "Daily streaks", path: "/habits", icon: <Target className="h-6 w-6" />, color: "bg-accent text-accent-foreground" },
  { label: "Goals", description: "Vision & milestones", path: "/goals", icon: <Trophy className="h-6 w-6" />, color: "bg-primary/10 text-primary" },
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
  const [financeBalance, setFinanceBalance] = useState<{ income: number; expense: number } | null>(null);
  const [fitnessToday, setFitnessToday] = useState<{ burned: number; eaten: number; mins: number } | null>(null);
  const [habitStats, setHabitStats] = useState<{ total: number; done: number; topStreak: number } | null>(null);
  const [goalStats, setGoalStats] = useState<{ active: number; completed: number } | null>(null);

  const loadOverview = useCallback(async () => {
    if (!user) return;
    const todayStr = format(new Date(), "yyyy-MM-dd");

    // All data fetches in parallel
    const [tasksRes, journalRes, examsRes, booksRes, txRes, workoutsRes, mealsRes, habitsRes, habitLogsRes, goalsRes] = await Promise.all([
      supabase.from("tasks").select("completed, due_date").eq("user_id", user.id),
      supabase.from("journal_entries").select("mood, date").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("exams").select("subject, exam_date").eq("user_id", user.id),
      supabase.from("books").select("status").eq("user_id", user.id),
      supabase.from("transactions").select("type, amount, date").eq("user_id", user.id),
      supabase.from("workouts").select("calories_burned, duration_mins, date").eq("user_id", user.id),
      supabase.from("meals").select("calories, date").eq("user_id", user.id),
      supabase.from("habits").select("id").eq("user_id", user.id),
      supabase.from("habit_logs").select("habit_id, date").eq("user_id", user.id),
      supabase.from("goals").select("status").eq("user_id", user.id),
    ]);

    // Tasks
    if (tasksRes.data) {
      const tt = tasksRes.data.filter((t) => t.due_date === todayStr);
      setTodayTasks({ total: tt.length, done: tt.filter((t) => t.completed).length });
    }

    // Journal mood
    if (journalRes.data?.[0]) setRecentMood({ mood: journalRes.data[0].mood, date: journalRes.data[0].date });

    // Exams
    if (examsRes.data) {
      const upcoming = examsRes.data
        .filter((e) => !isPast(new Date(e.exam_date)))
        .map((e) => ({ subject: e.subject, days: Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }))
        .sort((a, b) => a.days - b.days)
        .slice(0, 3);
      setUpcomingExams(upcoming);
    }

    // Books
    if (booksRes.data) {
      setReadingStats({
        reading: booksRes.data.filter((b) => b.status === "reading").length,
        completed: booksRes.data.filter((b) => b.status === "completed").length,
        tbr: booksRes.data.filter((b) => b.status === "tbr").length,
      });
    }

    // Finance - this month
    if (txRes.data) {
      const now = new Date();
      const monthTx = txRes.data.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      setFinanceBalance({
        income: monthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      });
    }

    // Fitness today
    if (workoutsRes.data && mealsRes.data) {
      setFitnessToday({
        burned: workoutsRes.data.filter(w => w.date === todayStr).reduce((s, w) => s + (w.calories_burned || 0), 0),
        eaten: mealsRes.data.filter(m => m.date === todayStr).reduce((s, m) => s + (m.calories || 0), 0),
        mins: workoutsRes.data.filter(w => w.date === todayStr).reduce((s, w) => s + (w.duration_mins || 0), 0),
      });
    }

    // Habits
    if (habitsRes.data && habitLogsRes.data) {
      const habitIds = habitsRes.data.map(h => h.id);
      const todayLogs = habitLogsRes.data.filter(l => l.date === todayStr);
      const doneToday = new Set(todayLogs.map(l => l.habit_id));
      // Calculate top streak
      let topStreak = 0;
      for (const hid of habitIds) {
        let streak = 0;
        const logDates = new Set(habitLogsRes.data.filter(l => l.habit_id === hid).map(l => l.date));
        for (let i = 0; i < 365; i++) {
          if (logDates.has(format(subDays(new Date(), i), "yyyy-MM-dd"))) streak++;
          else if (i > 0) break;
        }
        if (streak > topStreak) topStreak = streak;
      }
      setHabitStats({ total: habitIds.length, done: habitIds.filter(id => doneToday.has(id)).length, topStreak });
    }

    // Goals
    if (goalsRes.data) {
      setGoalStats({
        active: goalsRes.data.filter(g => g.status === "in_progress").length,
        completed: goalsRes.data.filter(g => g.status === "completed").length,
      });
    }

    // Wellness (localStorage)
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

      {/* Overview cards - Row 1 */}
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

      {/* Overview cards - Row 2: New corners */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Finance */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Finance</span>
            </div>
            {financeBalance ? (
              <div>
                <p className={`text-2xl font-bold ${(financeBalance.income - financeBalance.expense) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  ₹{(financeBalance.income - financeBalance.expense).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month's balance</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Fitness */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Fitness Today</span>
            </div>
            {fitnessToday && (fitnessToday.burned > 0 || fitnessToday.eaten > 0) ? (
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{fitnessToday.burned}</p>
                  <p className="text-muted-foreground">Burned</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{fitnessToday.eaten}</p>
                  <p className="text-muted-foreground">Eaten</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{fitnessToday.mins}</p>
                  <p className="text-muted-foreground">Mins</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity today</p>
            )}
          </CardContent>
        </Card>

        {/* Habits */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Habits</span>
            </div>
            {habitStats && habitStats.total > 0 ? (
              <div>
                <p className="text-2xl font-bold text-foreground">{habitStats.done}/{habitStats.total}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={habitStats.total > 0 ? (habitStats.done / habitStats.total) * 100 : 0} className="h-2 flex-1" />
                  {habitStats.topStreak > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 text-orange-500" />{habitStats.topStreak}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No habits yet</p>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Goals</span>
            </div>
            {goalStats && (goalStats.active > 0 || goalStats.completed > 0) ? (
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{goalStats.active}</p>
                  <p className="text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{goalStats.completed}</p>
                  <p className="text-muted-foreground">Done</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No goals yet</p>
            )}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {corners.map((corner) => (
          <Link
            key={corner.path}
            to={corner.path}
            className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${corner.color}`}>
              {corner.icon}
            </div>
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors text-sm">
              {corner.label}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {corner.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
