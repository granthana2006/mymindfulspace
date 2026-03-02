import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Flame, CheckCircle2 } from "lucide-react";
import { format, subDays, differenceInCalendarDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Habit { id: string; name: string; icon: string; color: string; frequency: string; target_count: number; }
interface HabitLog { id: string; habit_id: string; date: string; count: number; }

const ICONS = ["✅", "💧", "📖", "🏃", "🧘", "💊", "🎯", "✍️", "🛌", "🍎"];

const Habits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✅");
  const [color, setColor] = useState("#6366f1");

  const fetchAll = async () => {
    if (!user) return;
    const [h, l] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
    ]);
    if (h.data) setHabits(h.data);
    if (l.data) setLogs(l.data);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const addHabit = async () => {
    if (!user || !name) return;
    await supabase.from("habits").insert({ user_id: user.id, name, icon, color });
    setName(""); setShowForm(false); fetchAll();
    toast({ title: "Habit created! 🎯" });
  };

  const deleteHabit = async (id: string) => {
    await supabase.from("habits").delete().eq("id", id);
    fetchAll();
  };

  const toggleToday = async (habitId: string) => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const existing = logs.find(l => l.habit_id === habitId && l.date === today);
    if (existing) {
      await supabase.from("habit_logs").delete().eq("id", existing.id);
    } else {
      await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date: today });
    }
    fetchAll();
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    let day = new Date();
    const habitLogs = logs.filter(l => l.habit_id === habitId);
    const logDates = new Set(habitLogs.map(l => l.date));
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(day, i), "yyyy-MM-dd");
      if (logDates.has(d)) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));

  const completedToday = habits.filter(h => logs.some(l => l.habit_id === h.id && l.date === today)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🎯 Habit Tracker</h1>
          <p className="text-muted-foreground">{completedToday}/{habits.length} completed today</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Habit</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Create Habit</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Habit Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Drink Water" /></div>
          <div><Label>Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ICONS.map(i => (
                <button key={i} onClick={() => setIcon(i)}
                  className={`rounded-lg border-2 p-2 text-xl transition-all ${icon === i ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div><Label>Color</Label><Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-20" /></div>
          <Button onClick={addHabit} className="w-full">Create Habit</Button>
        </CardContent></Card>
      )}

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No habits yet. Create one to start tracking!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => {
            const isDoneToday = logs.some(l => l.habit_id === habit.id && l.date === today);
            const streak = getStreak(habit.id);
            return (
              <Card key={habit.id} className={`transition-all ${isDoneToday ? "ring-2 ring-green-500/50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleToday(habit.id)}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${isDoneToday ? "bg-green-500/20 scale-110" : "bg-muted hover:bg-muted/80"}`}>
                        {isDoneToday ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : <span>{habit.icon}</span>}
                      </button>
                      <div>
                        <p className={`font-semibold ${isDoneToday ? "text-green-500 line-through" : "text-foreground"}`}>{habit.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {streak > 0 && <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{streak} day streak</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* 7-day dots */}
                      <div className="hidden sm:flex gap-1">
                        {last7Days.map(d => {
                          const done = logs.some(l => l.habit_id === habit.id && l.date === d);
                          return <div key={d} className={`h-3 w-3 rounded-full ${done ? "bg-green-500" : "bg-muted"}`} title={d} />;
                        })}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Overall Stats */}
      {habits.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Completion Rate (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map(d => {
                const total = habits.length;
                const done = habits.filter(h => logs.some(l => l.habit_id === h.id && l.date === d)).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={d} className="text-center">
                    <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `hsl(142 ${pct}% 50% / 0.2)`, color: pct > 50 ? "#22c55e" : "var(--muted-foreground)" }}>
                      {pct}%
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(d), "EEE")}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Habits;
