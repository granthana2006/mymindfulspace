import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Smile, Trash2, Settings, Dumbbell, Flame, Apple, Clock,
  CheckCircle2, Circle, Target, Trophy, TrendingUp, Zap, Heart,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────
interface WellnessActivity {
  key: string; label: string; emoji: string; unit: string; goal: number;
  type: "counter" | "slider" | "number"; min?: number; max?: number; step?: number;
}
interface WellnessLog { id: string; date: string; values: Record<string, number>; notes: string; }
interface Workout { id: string; type: string; name: string; duration_mins: number; calories_burned: number; notes: string | null; date: string; }
interface Meal { id: string; meal_type: string; name: string; calories: number; protein: number; carbs: number; fat: number; date: string; }
interface Habit { id: string; name: string; icon: string; color: string; frequency: string; target_count: number; }
interface HabitLog { id: string; habit_id: string; date: string; count: number; }
interface Goal { id: string; title: string; description: string | null; category: string; target_date: string | null; status: string; progress: number; color: string; }
interface Milestone { id: string; goal_id: string; title: string; completed: boolean; due_date: string | null; }

const DEFAULT_ACTIVITIES: WellnessActivity[] = [
  { key: "water", label: "Water", emoji: "💧", unit: "glasses", goal: 8, type: "counter", min: 0, max: 20 },
  { key: "sleep", label: "Sleep", emoji: "🌙", unit: "hours", goal: 8, type: "slider", min: 0, max: 14, step: 0.5 },
  { key: "mood", label: "Mood", emoji: "😊", unit: "/10", goal: 10, type: "slider", min: 1, max: 10, step: 1 },
  { key: "exercise", label: "Exercise", emoji: "🏋️", unit: "minutes", goal: 30, type: "number", min: 0, max: 300 },
];
const WATER_UNIT_OPTIONS = ["glasses", "ml", "liters", "bottles"];
const SLEEP_UNIT_OPTIONS = ["hours", "minutes"];
const WORKOUT_TYPES = ["Cardio", "Strength", "Yoga", "HIIT", "Swimming", "Cycling", "Walking", "Other"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const HABIT_ICONS = ["✅", "💧", "📖", "🏃", "🧘", "💊", "🎯", "✍️", "🛌", "🍎"];
const CATEGORIES = ["Personal", "Career", "Health", "Education", "Finance", "Creative", "Social"];
const GOAL_COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];
const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--primary))", "hsl(var(--destructive))"];

const PersonalSpace = () => {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // ─── Wellness State ──────────────────────────────────────────
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [activities, setActivities] = useState<WellnessActivity[]>(DEFAULT_ACTIVITIES);
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);
  const [todayId, setTodayId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ label: "", emoji: "⭐", unit: "", goal: "10", type: "number" as WellnessActivity["type"] });

  // ─── Fitness State ───────────────────────────────────────────
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [wType, setWType] = useState("Cardio"); const [wName, setWName] = useState(""); const [wDuration, setWDuration] = useState(""); const [wCalories, setWCalories] = useState(""); const [wDate, setWDate] = useState(todayStr);
  const [mType, setMType] = useState("Lunch"); const [mName, setMName] = useState(""); const [mCalories, setMCalories] = useState(""); const [mProtein, setMProtein] = useState(""); const [mCarbs, setMCarbs] = useState(""); const [mFat, setMFat] = useState(""); const [mDate, setMDate] = useState(todayStr);

  // ─── Habits State ────────────────────────────────────────────
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [hName, setHName] = useState(""); const [hIcon, setHIcon] = useState("✅"); const [hColor, setHColor] = useState("#6366f1");

  // ─── Goals State ─────────────────────────────────────────────
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [gTitle, setGTitle] = useState(""); const [gDesc, setGDesc] = useState(""); const [gCategory, setGCategory] = useState("Personal"); const [gDate, setGDate] = useState(""); const [gColor, setGColor] = useState("#6366f1");
  const [addingMsFor, setAddingMsFor] = useState<string | null>(null); const [msTitle, setMsTitle] = useState("");

  // ─── Load All Data ───────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!user) return;

    // Wellness from localStorage
    const savedActs = localStorage.getItem(`wellness-activities-${user.id}`);
    const acts: WellnessActivity[] = savedActs ? JSON.parse(savedActs) : DEFAULT_ACTIVITIES;
    setActivities(acts);
    const initVals: Record<string, number> = {};
    acts.forEach(a => { initVals[a.key] = a.type === "slider" ? (a.min || 0) : 0; });
    const stored = localStorage.getItem(`wellness-v2-${user.id}`);
    if (stored) {
      const parsed: WellnessLog[] = JSON.parse(stored);
      setWellnessLogs(parsed);
      const today = parsed.find(l => l.date === todayStr);
      if (today) { setValues({ ...initVals, ...today.values }); setNotes(today.notes); setTodayLogged(true); setTodayId(today.id); }
      else setValues(initVals);
    } else setValues(initVals);

    // DB data
    const [w, m, h, hl, g, ms] = await Promise.all([
      supabase.from("workouts").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("meals").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("habits").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("milestones").select("*").eq("user_id", user.id),
    ]);
    if (w.data) setWorkouts(w.data);
    if (m.data) setMeals(m.data);
    if (h.data) setHabits(h.data);
    if (hl.data) setHabitLogs(hl.data);
    if (g.data) setGoals(g.data);
    if (ms.data) setMilestones(ms.data);
  }, [user, todayStr]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Wellness Helpers ────────────────────────────────────────
  const saveActivities = (acts: WellnessActivity[]) => { if (!user) return; setActivities(acts); localStorage.setItem(`wellness-activities-${user.id}`, JSON.stringify(acts)); };
  const saveLogs = (updatedLogs: WellnessLog[]) => { if (!user) return; localStorage.setItem(`wellness-v2-${user.id}`, JSON.stringify(updatedLogs)); setWellnessLogs(updatedLogs); };
  const handleSaveToday = () => {
    const entry: WellnessLog = { id: todayId || crypto.randomUUID(), date: todayStr, values, notes };
    const updated = todayLogged ? wellnessLogs.map(l => l.date === todayStr ? entry : l) : [...wellnessLogs, entry];
    saveLogs(updated); setTodayLogged(true); setTodayId(entry.id); toast.success("Wellness log saved! 💚");
  };
  const handleAddActivity = () => {
    if (!newActivity.label.trim()) return;
    const key = newActivity.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const act: WellnessActivity = { key, label: newActivity.label, emoji: newActivity.emoji || "⭐", unit: newActivity.unit || "units", goal: parseFloat(newActivity.goal) || 10, type: newActivity.type, min: 0, max: newActivity.type === "slider" ? parseFloat(newActivity.goal) || 10 : 999, step: newActivity.type === "slider" ? 1 : undefined };
    saveActivities([...activities, act]); setValues(v => ({ ...v, [key]: 0 }));
    setNewActivity({ label: "", emoji: "⭐", unit: "", goal: "10", type: "number" }); setShowAddActivity(false); toast.success(`${act.label} added!`);
  };
  const handleRemoveActivity = (key: string) => { saveActivities(activities.filter(a => a.key !== key)); setValues(v => { const n = { ...v }; delete n[key]; return n; }); };
  const handleUpdateGoal = (key: string, goal: number) => { saveActivities(activities.map(a => a.key === key ? { ...a, goal } : a)); };
  const handleUpdateUnit = (key: string, unit: string) => { saveActivities(activities.map(a => a.key === key ? { ...a, unit } : a)); };
  const setValue = (key: string, val: number) => setValues(v => ({ ...v, [key]: val }));

  // ─── Fitness Helpers ─────────────────────────────────────────
  const refetchFitness = async () => {
    if (!user) return;
    const [w, m] = await Promise.all([
      supabase.from("workouts").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("meals").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    ]);
    if (w.data) setWorkouts(w.data); if (m.data) setMeals(m.data);
  };
  const addWorkout = async () => {
    if (!user || !wName) return;
    await supabase.from("workouts").insert({ user_id: user.id, type: wType, name: wName, duration_mins: parseInt(wDuration) || 0, calories_burned: parseInt(wCalories) || 0, date: wDate });
    setWName(""); setWDuration(""); setWCalories(""); setShowWorkoutForm(false); refetchFitness(); uiToast({ title: "Workout logged! 💪" });
  };
  const addMeal = async () => {
    if (!user || !mName) return;
    await supabase.from("meals").insert({ user_id: user.id, meal_type: mType, name: mName, calories: parseInt(mCalories) || 0, protein: parseFloat(mProtein) || 0, carbs: parseFloat(mCarbs) || 0, fat: parseFloat(mFat) || 0, date: mDate });
    setMName(""); setMCalories(""); setMProtein(""); setMCarbs(""); setMFat(""); setShowMealForm(false); refetchFitness(); uiToast({ title: "Meal logged! 🍎" });
  };
  const deleteWorkout = async (id: string) => { await supabase.from("workouts").delete().eq("id", id); refetchFitness(); };
  const deleteMeal = async (id: string) => { await supabase.from("meals").delete().eq("id", id); refetchFitness(); };

  // ─── Habits Helpers ──────────────────────────────────────────
  const refetchHabits = async () => {
    if (!user) return;
    const [h, hl] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
    ]);
    if (h.data) setHabits(h.data); if (hl.data) setHabitLogs(hl.data);
  };
  const addHabit = async () => {
    if (!user || !hName) return;
    await supabase.from("habits").insert({ user_id: user.id, name: hName, icon: hIcon, color: hColor });
    setHName(""); setShowHabitForm(false); refetchHabits(); uiToast({ title: "Habit created! 🎯" });
  };
  const deleteHabit = async (id: string) => { await supabase.from("habits").delete().eq("id", id); refetchHabits(); };
  const toggleHabitToday = async (habitId: string) => {
    if (!user) return;
    const existing = habitLogs.find(l => l.habit_id === habitId && l.date === todayStr);
    if (existing) await supabase.from("habit_logs").delete().eq("id", existing.id);
    else await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date: todayStr });
    refetchHabits();
  };
  const getStreak = (habitId: string) => {
    let streak = 0;
    const logDates = new Set(habitLogs.filter(l => l.habit_id === habitId).map(l => l.date));
    for (let i = 0; i < 365; i++) { if (logDates.has(format(subDays(new Date(), i), "yyyy-MM-dd"))) streak++; else if (i > 0) break; }
    return streak;
  };

  // ─── Goals Helpers ───────────────────────────────────────────
  const refetchGoals = async () => {
    if (!user) return;
    const [g, ms] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("milestones").select("*").eq("user_id", user.id),
    ]);
    if (g.data) setGoals(g.data); if (ms.data) setMilestones(ms.data);
  };
  const addGoal = async () => {
    if (!user || !gTitle) return;
    await supabase.from("goals").insert({ user_id: user.id, title: gTitle, description: gDesc || null, category: gCategory, color: gColor, target_date: gDate || null });
    setGTitle(""); setGDesc(""); setShowGoalForm(false); refetchGoals(); uiToast({ title: "Goal created! 🎯" });
  };
  const deleteGoal = async (id: string) => { await supabase.from("goals").delete().eq("id", id); refetchGoals(); };
  const addMilestone = async (goalId: string) => {
    if (!user || !msTitle) return;
    await supabase.from("milestones").insert({ user_id: user.id, goal_id: goalId, title: msTitle });
    setMsTitle(""); setAddingMsFor(null); refetchGoals();
  };
  const toggleMilestone = async (ms: Milestone) => {
    await supabase.from("milestones").update({ completed: !ms.completed }).eq("id", ms.id);
    const goalMs = milestones.filter(m => m.goal_id === ms.goal_id);
    const completed = goalMs.filter(m => m.id === ms.id ? !ms.completed : m.completed).length;
    const progress = goalMs.length > 0 ? Math.round((completed / goalMs.length) * 100) : 0;
    await supabase.from("goals").update({ progress, status: progress >= 100 ? "completed" : "in_progress" }).eq("id", ms.goal_id);
    refetchGoals();
  };
  const deleteMilestone = async (id: string) => { await supabase.from("milestones").delete().eq("id", id); refetchGoals(); };

  // ─── Computed Cross-Corner Data ──────────────────────────────
  const todayCalsBurned = workouts.filter(w => w.date === todayStr).reduce((s, w) => s + (w.calories_burned || 0), 0);
  const todayCalsEaten = meals.filter(m => m.date === todayStr).reduce((s, m) => s + (m.calories || 0), 0);
  const todayMins = workouts.filter(w => w.date === todayStr).reduce((s, w) => s + (w.duration_mins || 0), 0);
  const completedHabitsToday = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === todayStr)).length;
  const habitCompletionPct = habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0;
  const activeGoals = goals.filter(g => g.status === "in_progress").length;
  const completedGoals = goals.filter(g => g.status === "completed").length;
  const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;
  const moodVal = values.mood || 5;
  const moodEmoji = moodVal >= 9 ? "🤩" : moodVal >= 7 ? "😊" : moodVal >= 5 ? "😐" : moodVal >= 3 ? "😔" : "😢";
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));

  // Cross-corner: Radar chart data
  const radarData = [
    { subject: "Wellness", value: activities.length > 0 ? Math.round(Object.keys(values).reduce((s, k) => { const a = activities.find(ac => ac.key === k); return s + (a ? Math.min(100, ((values[k] || 0) / a.goal) * 100) : 0); }, 0) / activities.length) : 0 },
    { subject: "Fitness", value: Math.min(100, todayMins * 100 / 30) },
    { subject: "Nutrition", value: todayCalsEaten > 0 ? Math.min(100, 70) : 0 },
    { subject: "Habits", value: habitCompletionPct },
    { subject: "Goals", value: avgGoalProgress },
  ];

  // Cross-corner: calorie balance chart (7 days)
  const calorieBalanceData = last7Days.map(d => ({
    day: format(new Date(d), "EEE"),
    burned: workouts.filter(w => w.date === d).reduce((s, w) => s + (w.calories_burned || 0), 0),
    eaten: meals.filter(m => m.date === d).reduce((s, m) => s + (m.calories || 0), 0),
  }));

  // Macro data for today
  const macroData = (() => {
    const tm = meals.filter(m => m.date === todayStr);
    const p = tm.reduce((s, m) => s + Number(m.protein || 0), 0);
    const c = tm.reduce((s, m) => s + Number(m.carbs || 0), 0);
    const f = tm.reduce((s, m) => s + Number(m.fat || 0), 0);
    if (p + c + f === 0) return [];
    return [{ name: "Protein", value: p }, { name: "Carbs", value: c }, { name: "Fat", value: f }];
  })();

  // Wellness weekly chart data
  const wellnessWeekData = last7Days.map(d => {
    const log = wellnessLogs.find(l => l.date === d);
    const row: Record<string, any> = { day: format(new Date(d), "EEE") };
    activities.forEach(a => { row[a.key] = log?.values?.[a.key] || 0; });
    return row;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" /> Personal Space
        </h1>
        <p className="text-muted-foreground">Your wellness, fitness, habits & goals — all in one place</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="wellness" className="text-xs sm:text-sm">Wellness</TabsTrigger>
          <TabsTrigger value="fitness" className="text-xs sm:text-sm">Fitness</TabsTrigger>
          <TabsTrigger value="habits" className="text-xs sm:text-sm">Habits</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm">Goals</TabsTrigger>
        </TabsList>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Quick Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-transparent">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-orange-500/10 p-3"><Flame className="h-5 w-5 text-orange-500" /></div>
                <div><p className="text-xs text-muted-foreground">Calories Burned</p><p className="text-xl font-bold text-foreground">{todayCalsBurned}</p></div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-3"><Apple className="h-5 w-5 text-green-500" /></div>
                <div><p className="text-xs text-muted-foreground">Calories Eaten</p><p className="text-xl font-bold text-foreground">{todayCalsEaten}</p></div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3"><Target className="h-5 w-5 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Habits Done</p><p className="text-xl font-bold text-foreground">{completedHabitsToday}/{habits.length}</p></div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-yellow-500/5 to-transparent">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-yellow-500/10 p-3"><Trophy className="h-5 w-5 text-yellow-500" /></div>
                <div><p className="text-xs text-muted-foreground">Goals Progress</p><p className="text-xl font-bold text-foreground">{avgGoalProgress}%</p></div>
              </CardContent>
            </Card>
          </div>

          {/* Cross-Corner Insights */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Life Balance Radar */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Life Balance Score</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Today" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Calorie Balance: Burned vs Eaten */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> 7-Day Calorie Balance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={calorieBalanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="burned" fill="hsl(var(--chart-1))" name="Burned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="eaten" fill="hsl(var(--chart-2))" name="Eaten" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Habit completion → Goal boost insight */}
          {habitCompletionPct >= 80 && activeGoals > 0 && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-semibold text-foreground">You're on fire!</p>
                  <p className="text-sm text-muted-foreground">{habitCompletionPct}% habits done today — your consistency is fueling progress on {activeGoals} active goal{activeGoals > 1 ? "s" : ""}!</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Net calorie insight */}
          {(todayCalsBurned > 0 || todayCalsEaten > 0) && (
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{todayCalsEaten - todayCalsBurned > 0 ? "🍽️" : "💪"}</span>
                <div>
                  <p className="font-semibold text-foreground">Net Calories: {todayCalsEaten - todayCalsBurned} cal</p>
                  <p className="text-sm text-muted-foreground">
                    {todayCalsEaten - todayCalsBurned > 500 ? "You're in surplus — great if bulking!" : todayCalsEaten - todayCalsBurned < -200 ? "Good calorie deficit today!" : "Balanced intake today!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════ WELLNESS TAB ═══════════════ */}
        <TabsContent value="wellness" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Track your daily wellness — customize it your way</p>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowSettings(s => !s)}><Settings className="h-3.5 w-3.5" /> Customize</Button>
          </div>

          {showSettings && (
            <Card className="border-border/50 bg-card/90"><CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Your Activities</h3>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddActivity(true)}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              {activities.map(a => (
                <div key={a.key} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{a.emoji}</span>
                  <span className="flex-1 font-medium text-foreground">{a.label}</span>
                  <div className="flex items-center gap-1"><Label className="text-[10px]">Goal:</Label><Input type="number" value={a.goal} onChange={e => handleUpdateGoal(a.key, parseFloat(e.target.value) || 1)} className="w-16 h-7 text-xs" /></div>
                  {a.key === "water" && <Select value={a.unit} onValueChange={v => handleUpdateUnit(a.key, v)}><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{WATER_UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>}
                  {a.key === "sleep" && <Select value={a.unit} onValueChange={v => handleUpdateUnit(a.key, v)}><SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{SLEEP_UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>}
                  {!["water", "sleep", "mood"].includes(a.key) && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveActivity(a.key)}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              ))}
            </CardContent></Card>
          )}

          <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
            <DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Add New Activity</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={newActivity.label} onChange={e => setNewActivity(a => ({ ...a, label: e.target.value }))} placeholder="e.g. Reading, Meditation..." /></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Emoji</Label><Input value={newActivity.emoji} onChange={e => setNewActivity(a => ({ ...a, emoji: e.target.value }))} /></div><div><Label>Unit</Label><Input value={newActivity.unit} onChange={e => setNewActivity(a => ({ ...a, unit: e.target.value }))} placeholder="pages, mins..." /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><Label>Goal</Label><Input type="number" value={newActivity.goal} onChange={e => setNewActivity(a => ({ ...a, goal: e.target.value }))} /></div><div><Label>Type</Label><Select value={newActivity.type} onValueChange={(v: any) => setNewActivity(a => ({ ...a, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="counter">Counter</SelectItem><SelectItem value="slider">Slider</SelectItem><SelectItem value="number">Number</SelectItem></SelectContent></Select></div></div>
                <Button onClick={handleAddActivity} className="w-full">Add Activity</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activities.map(act => {
              const val = values[act.key] || 0;
              const percent = Math.min(100, (val / act.goal) * 100);
              const isMood = act.key === "mood";
              return (
                <Card key={act.key} className="border-border/50 bg-card/90 overflow-hidden"><CardContent className="p-4 text-center">
                  <div className="mx-auto mb-2 text-3xl">{isMood ? moodEmoji : act.emoji}</div>
                  <p className="text-3xl font-bold text-foreground">{isMood ? `${val}/10` : val}</p>
                  <p className="text-xs text-muted-foreground">{isMood ? "How you feel" : `of ${act.goal} ${act.unit}`}</p>
                  <Progress value={percent} className="mt-2 h-2" />
                  <div className="mt-3">
                    {act.type === "counter" && <Button size="sm" variant="outline" className="gap-1" onClick={() => setValue(act.key, val + 1)}><Plus className="h-3 w-3" /> Add</Button>}
                    {act.type === "slider" && <Slider value={[val]} onValueChange={([v]) => setValue(act.key, v)} min={act.min || 0} max={act.max || 10} step={act.step || 1} />}
                    {act.type === "number" && <Input type="number" value={val} onChange={e => setValue(act.key, parseInt(e.target.value) || 0)} min={0} className="text-center" />}
                  </div>
                </CardContent></Card>
              );
            })}
          </div>

          <Card className="border-border/50 bg-card/90"><CardContent className="p-4 space-y-3">
            <Label>Quick notes</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was your day?" />
            <Button onClick={handleSaveToday} className="w-full gap-2"><Smile className="h-4 w-4" />{todayLogged ? "Update Log" : "Save Log"}</Button>
          </CardContent></Card>

          {wellnessLogs.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {activities.map((act, idx) => (
                <Card key={act.key} className="border-border/50 bg-card/90"><CardContent className="p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><span>{act.emoji}</span> {act.label}</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={wellnessWeekData}>
                      <defs><linearGradient id={`wg-${act.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"><p>{payload[0].value} {act.unit}</p></div> : null} />
                      <Area type="monotone" dataKey={act.key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={`url(#wg-${act.key})`} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════ FITNESS TAB ═══════════════ */}
        <TabsContent value="fitness" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Track workouts & nutrition</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setShowWorkoutForm(!showWorkoutForm); setShowMealForm(false); }}><Dumbbell className="mr-1 h-3 w-3" /> Workout</Button>
              <Button size="sm" variant="outline" onClick={() => { setShowMealForm(!showMealForm); setShowWorkoutForm(false); }}><Apple className="mr-1 h-3 w-3" /> Meal</Button>
            </div>
          </div>

          {/* Today stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-full bg-orange-500/10 p-2"><Flame className="h-5 w-5 text-orange-500" /></div><div><p className="text-xs text-muted-foreground">Burned</p><p className="text-xl font-bold text-foreground">{todayCalsBurned} cal</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-full bg-green-500/10 p-2"><Apple className="h-5 w-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Eaten</p><p className="text-xl font-bold text-foreground">{todayCalsEaten} cal</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><div className="rounded-full bg-primary/10 p-2"><Clock className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold text-foreground">{todayMins} min</p></div></CardContent></Card>
          </div>

          {showWorkoutForm && (
            <Card><CardHeader><CardTitle>Log Workout</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><div><Label>Type</Label><Select value={wType} onValueChange={setWType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WORKOUT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div><div><Label>Date</Label><Input type="date" value={wDate} onChange={e => setWDate(e.target.value)} /></div></div>
              <div><Label>Name</Label><Input value={wName} onChange={e => setWName(e.target.value)} placeholder="e.g. Morning Run" /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Duration (min)</Label><Input type="number" value={wDuration} onChange={e => setWDuration(e.target.value)} /></div><div><Label>Calories Burned</Label><Input type="number" value={wCalories} onChange={e => setWCalories(e.target.value)} /></div></div>
              <Button onClick={addWorkout} className="w-full">Save Workout</Button>
            </CardContent></Card>
          )}

          {showMealForm && (
            <Card><CardHeader><CardTitle>Log Meal</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><div><Label>Type</Label><Select value={mType} onValueChange={setMType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div><div><Label>Date</Label><Input type="date" value={mDate} onChange={e => setMDate(e.target.value)} /></div></div>
              <div><Label>Food Name</Label><Input value={mName} onChange={e => setMName(e.target.value)} placeholder="e.g. Grilled Chicken Salad" /></div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><Label>Calories</Label><Input type="number" value={mCalories} onChange={e => setMCalories(e.target.value)} /></div><div><Label>Protein (g)</Label><Input type="number" value={mProtein} onChange={e => setMProtein(e.target.value)} /></div><div><Label>Carbs (g)</Label><Input type="number" value={mCarbs} onChange={e => setMCarbs(e.target.value)} /></div><div><Label>Fat (g)</Label><Input type="number" value={mFat} onChange={e => setMFat(e.target.value)} /></div></div>
              <Button onClick={addMeal} className="w-full">Save Meal</Button>
            </CardContent></Card>
          )}

          {/* Recent workouts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Recent Workouts</h3>
            <div className="space-y-2">
              {workouts.length === 0 ? <p className="py-4 text-center text-muted-foreground text-sm">No workouts yet</p> :
                workouts.slice(0, 10).map(w => (
                  <Card key={w.id}><CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3"><div className="rounded-full bg-orange-500/10 p-2"><Dumbbell className="h-4 w-4 text-orange-500" /></div><div><p className="font-medium text-foreground text-sm">{w.name}</p><p className="text-xs text-muted-foreground">{w.type} · {w.duration_mins}min · {w.calories_burned}cal · {format(new Date(w.date), "dd MMM")}</p></div></div>
                    <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)}><Trash2 className="h-4 w-4" /></Button>
                  </CardContent></Card>
                ))}
            </div>
          </div>

          {/* Recent meals */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Recent Meals</h3>
            <div className="space-y-2">
              {meals.length === 0 ? <p className="py-4 text-center text-muted-foreground text-sm">No meals yet</p> :
                meals.slice(0, 10).map(m => (
                  <Card key={m.id}><CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3"><div className="rounded-full bg-green-500/10 p-2"><Apple className="h-4 w-4 text-green-500" /></div><div><p className="font-medium text-foreground text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.meal_type} · {m.calories}cal · P:{Number(m.protein)}g · {format(new Date(m.date), "dd MMM")}</p></div></div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMeal(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </CardContent></Card>
                ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">7-Day Calories</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={calorieBalanceData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip /><Legend /><Bar dataKey="burned" fill="hsl(var(--chart-1))" name="Burned" radius={[4, 4, 0, 0]} /><Bar dataKey="eaten" fill="hsl(var(--chart-2))" name="Eaten" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Today's Macros</CardTitle></CardHeader><CardContent>
              {macroData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={macroData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}g`}>{macroData.map((_, i) => <Cell key={i} fill={["hsl(var(--chart-3))", "hsl(var(--chart-1))", "hsl(var(--chart-2))"][i]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="py-8 text-center text-muted-foreground text-sm">Log meals to see macros</p>}
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* ═══════════════ HABITS TAB ═══════════════ */}
        <TabsContent value="habits" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{completedHabitsToday}/{habits.length} completed today</p>
            <Button size="sm" onClick={() => setShowHabitForm(!showHabitForm)}><Plus className="mr-1 h-3 w-3" /> New Habit</Button>
          </div>

          {showHabitForm && (
            <Card><CardHeader><CardTitle>Create Habit</CardTitle></CardHeader><CardContent className="space-y-4">
              <div><Label>Name</Label><Input value={hName} onChange={e => setHName(e.target.value)} placeholder="e.g. Drink Water" /></div>
              <div><Label>Icon</Label><div className="flex flex-wrap gap-2 mt-1">{HABIT_ICONS.map(i => (<button key={i} onClick={() => setHIcon(i)} className={`rounded-lg border-2 p-2 text-xl transition-all ${hIcon === i ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50"}`}>{i}</button>))}</div></div>
              <div><Label>Color</Label><Input type="color" value={hColor} onChange={e => setHColor(e.target.value)} className="h-10 w-20" /></div>
              <Button onClick={addHabit} className="w-full">Create Habit</Button>
            </CardContent></Card>
          )}

          {habits.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No habits yet. Create one to start!</CardContent></Card> : (
            <div className="space-y-3">
              {habits.map(habit => {
                const isDone = habitLogs.some(l => l.habit_id === habit.id && l.date === todayStr);
                const streak = getStreak(habit.id);
                return (
                  <Card key={habit.id} className={`transition-all ${isDone ? "ring-2 ring-green-500/50" : ""}`}><CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleHabitToday(habit.id)} className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${isDone ? "bg-green-500/20 scale-110" : "bg-muted hover:bg-muted/80"}`}>
                          {isDone ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : <span>{habit.icon}</span>}
                        </button>
                        <div><p className={`font-semibold ${isDone ? "text-green-500 line-through" : "text-foreground"}`}>{habit.name}</p>{streak > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="h-3 w-3 text-orange-500" />{streak} day streak</span>}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex gap-1">{last7Days.map(d => <div key={d} className={`h-3 w-3 rounded-full ${habitLogs.some(l => l.habit_id === habit.id && l.date === d) ? "bg-green-500" : "bg-muted"}`} />)}</div>
                        <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent></Card>
                );
              })}
            </div>
          )}

          {habits.length > 0 && (
            <Card><CardHeader><CardTitle className="text-sm">Completion Rate (Last 7 Days)</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-7 gap-2">{last7Days.map(d => {
                const done = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === d)).length;
                const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
                return (<div key={d} className="text-center"><div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: `hsl(142 ${pct}% 50% / 0.2)`, color: pct > 50 ? "#22c55e" : "var(--muted-foreground)" }}>{pct}%</div><p className="text-xs text-muted-foreground">{format(new Date(d), "EEE")}</p></div>);
              })}</div>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══════════════ GOALS TAB ═══════════════ */}
        <TabsContent value="goals" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{completedGoals}/{goals.length} goals achieved</p>
            <Button size="sm" onClick={() => setShowGoalForm(!showGoalForm)}><Plus className="mr-1 h-3 w-3" /> New Goal</Button>
          </div>

          {showGoalForm && (
            <Card><CardHeader><CardTitle>Set a New Goal</CardTitle></CardHeader><CardContent className="space-y-4">
              <div><Label>Title</Label><Input value={gTitle} onChange={e => setGTitle(e.target.value)} placeholder="e.g. Learn a new language" /></div>
              <div><Label>Description</Label><Textarea value={gDesc} onChange={e => setGDesc(e.target.value)} placeholder="Why this goal matters..." /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Category</Label><Select value={gCategory} onValueChange={setGCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div><Label>Target Date</Label><Input type="date" value={gDate} onChange={e => setGDate(e.target.value)} /></div></div>
              <div><Label>Color</Label><div className="flex gap-2 mt-1">{GOAL_COLORS.map(c => <button key={c} onClick={() => setGColor(c)} className={`h-8 w-8 rounded-full transition-all ${gColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`} style={{ backgroundColor: c }} />)}</div></div>
              <Button onClick={addGoal} className="w-full">Create Goal</Button>
            </CardContent></Card>
          )}

          {goals.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No goals yet. Dream big! 🌟</CardContent></Card> : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {goals.map(goal => {
                const gMs = milestones.filter(m => m.goal_id === goal.id);
                const isDone = goal.status === "completed";
                return (
                  <Card key={goal.id} className={`overflow-hidden ${isDone ? "ring-2 ring-green-500/30" : ""}`}>
                    <div className="h-2" style={{ backgroundColor: goal.color }} />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">{isDone ? <Trophy className="h-5 w-5 text-yellow-500" /> : <Target className="h-5 w-5" style={{ color: goal.color }} />}<CardTitle className={`text-lg ${isDone ? "line-through text-muted-foreground" : ""}`}>{goal.title}</CardTitle></div>
                        <div className="flex items-center gap-1"><Badge variant="secondary">{goal.category}</Badge><Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                      {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2"><Progress value={goal.progress} className="flex-1" /><span className="text-sm font-medium text-foreground">{goal.progress}%</span></div>
                      {goal.target_date && <p className="text-xs text-muted-foreground">🎯 Target: {format(new Date(goal.target_date), "dd MMM yyyy")}</p>}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestones</p>
                        {gMs.map(ms => (
                          <div key={ms.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                            <button onClick={() => toggleMilestone(ms)} className="flex items-center gap-2 text-sm">{ms.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}<span className={ms.completed ? "line-through text-muted-foreground" : "text-foreground"}>{ms.title}</span></button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMilestone(ms.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        ))}
                        {addingMsFor === goal.id ? (
                          <div className="flex gap-2 mt-1"><Input value={msTitle} onChange={e => setMsTitle(e.target.value)} placeholder="Milestone title" className="text-sm" /><Button size="sm" onClick={() => addMilestone(goal.id)}>Add</Button><Button size="sm" variant="ghost" onClick={() => setAddingMsFor(null)}>✕</Button></div>
                        ) : (
                          <button onClick={() => setAddingMsFor(goal.id)} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"><Plus className="h-3 w-3" /> Add milestone</button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalSpace;
