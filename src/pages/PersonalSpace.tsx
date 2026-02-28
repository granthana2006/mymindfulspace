import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Droplets, Moon, Heart, Plus, TrendingUp, Smile } from "lucide-react";
import { format, subDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

interface WellnessLog {
  id: string;
  date: string;
  water_glasses: number;
  sleep_hours: number;
  mood_score: number;
  exercise_mins: number;
  notes: string;
}

const WATER_GOAL = 8;
const SLEEP_GOAL = 8;

const PersonalSpace = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Today's values
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [moodScore, setMoodScore] = useState(7);
  const [exercise, setExercise] = useState(0);
  const [notes, setNotes] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);
  const [todayId, setTodayId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    // Using localStorage since we don't have a wellness table yet
    const stored = localStorage.getItem(`wellness-${user.id}`);
    if (stored) {
      const parsed: WellnessLog[] = JSON.parse(stored);
      setLogs(parsed);
      const today = parsed.find((l) => l.date === todayStr);
      if (today) {
        setWater(today.water_glasses);
        setSleep(today.sleep_hours);
        setMoodScore(today.mood_score);
        setExercise(today.exercise_mins);
        setNotes(today.notes);
        setTodayLogged(true);
        setTodayId(today.id);
      }
    }
    setLoading(false);
  }, [user, todayStr]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const saveLogs = (updatedLogs: WellnessLog[]) => {
    if (!user) return;
    localStorage.setItem(`wellness-${user.id}`, JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
  };

  const handleSaveToday = () => {
    const entry: WellnessLog = {
      id: todayId || crypto.randomUUID(),
      date: todayStr,
      water_glasses: water,
      sleep_hours: sleep,
      mood_score: moodScore,
      exercise_mins: exercise,
      notes,
    };

    const updated = todayLogged
      ? logs.map((l) => (l.date === todayStr ? entry : l))
      : [...logs, entry];

    saveLogs(updated);
    setTodayLogged(true);
    setTodayId(entry.id);
    toast.success("Wellness log saved! 💚");
  };

  const addWater = () => {
    setWater((w) => w + 1);
  };

  // Weekly chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dateStr = format(day, "yyyy-MM-dd");
    const log = logs.find((l) => l.date === dateStr);
    return {
      day: format(day, "EEE"),
      water: log?.water_glasses || 0,
      sleep: log?.sleep_hours || 0,
      mood: log?.mood_score || 0,
      exercise: log?.exercise_mins || 0,
    };
  });

  const moodEmoji = moodScore >= 9 ? "🤩" : moodScore >= 7 ? "😊" : moodScore >= 5 ? "😐" : moodScore >= 3 ? "😔" : "😢";
  const waterPercent = Math.min(100, (water / WATER_GOAL) * 100);
  const sleepPercent = Math.min(100, (sleep / SLEEP_GOAL) * 100);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Personal Space</h1>
        <p className="text-muted-foreground">Track your daily wellness — water, sleep, mood & exercise</p>
      </div>

      {/* Today's tracker */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Water */}
        <Card className="border-border/50 bg-card/90 overflow-hidden">
          <CardContent className="p-4 text-center">
            <Droplets className="mx-auto mb-2 h-8 w-8 text-chart-1" />
            <p className="text-3xl font-bold text-foreground">{water}</p>
            <p className="text-xs text-muted-foreground">of {WATER_GOAL} glasses</p>
            <Progress value={waterPercent} className="mt-2 h-2" />
            <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={addWater}>
              <Plus className="h-3 w-3" /> Add Glass
            </Button>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card className="border-border/50 bg-card/90">
          <CardContent className="p-4 text-center">
            <Moon className="mx-auto mb-2 h-8 w-8 text-chart-3" />
            <p className="text-3xl font-bold text-foreground">{sleep}h</p>
            <p className="text-xs text-muted-foreground">of {SLEEP_GOAL}h goal</p>
            <Progress value={sleepPercent} className="mt-2 h-2" />
            <div className="mt-3">
              <Slider value={[sleep]} onValueChange={([v]) => setSleep(v)} min={0} max={12} step={0.5} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Mood */}
        <Card className="border-border/50 bg-card/90">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 text-4xl">{moodEmoji}</div>
            <p className="text-3xl font-bold text-foreground">{moodScore}/10</p>
            <p className="text-xs text-muted-foreground">How you feel</p>
            <div className="mt-3">
              <Slider value={[moodScore]} onValueChange={([v]) => setMoodScore(v)} min={1} max={10} step={1} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Exercise */}
        <Card className="border-border/50 bg-card/90">
          <CardContent className="p-4 text-center">
            <Heart className="mx-auto mb-2 h-8 w-8 text-destructive" />
            <p className="text-3xl font-bold text-foreground">{exercise}</p>
            <p className="text-xs text-muted-foreground">minutes active</p>
            <div className="mt-3">
              <Input type="number" value={exercise} onChange={(e) => setExercise(parseInt(e.target.value) || 0)} min={0} className="text-center" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes & save */}
      <Card className="border-border/50 bg-card/90">
        <CardContent className="p-4 space-y-3">
          <Label>Quick notes for today</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How was your day? Any highlights?" />
          <Button onClick={handleSaveToday} className="w-full gap-2">
            <Smile className="h-4 w-4" />
            {todayLogged ? "Update Today's Log" : "Save Today's Log"}
          </Button>
        </CardContent>
      </Card>

      {/* Weekly charts */}
      {logs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/50 bg-card/90">
            <CardContent className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Droplets className="h-4 w-4 text-chart-1" /> Water Intake
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"><p>{payload[0].value} glasses</p></div> : null} />
                  <Area type="monotone" dataKey="water" stroke="hsl(var(--chart-1))" fill="url(#waterGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--chart-1))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/90">
            <CardContent className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Moon className="h-4 w-4 text-chart-3" /> Sleep Pattern
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"><p>{payload[0].value}h sleep</p></div> : null} />
                  <Area type="monotone" dataKey="sleep" stroke="hsl(var(--chart-3))" fill="url(#sleepGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--chart-3))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/90">
            <CardContent className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Smile className="h-4 w-4 text-chart-4" /> Mood Trend
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"><p>Mood: {payload[0].value}/10</p></div> : null} />
                  <Area type="monotone" dataKey="mood" stroke="hsl(var(--chart-4))" fill="url(#moodGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--chart-4))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/90">
            <CardContent className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Heart className="h-4 w-4 text-destructive" /> Exercise
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="exerciseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md"><p>{payload[0].value} min</p></div> : null} />
                  <Area type="monotone" dataKey="exercise" stroke="hsl(var(--destructive))" fill="url(#exerciseGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--destructive))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PersonalSpace;
