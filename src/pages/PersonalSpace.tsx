import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Moon, Heart, Plus, Smile, Trash2, Settings, Dumbbell } from "lucide-react";
import { format, subDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

interface WellnessActivity {
  key: string;
  label: string;
  emoji: string;
  unit: string;
  goal: number;
  type: "counter" | "slider" | "number";
  min?: number;
  max?: number;
  step?: number;
}

interface WellnessLog {
  id: string;
  date: string;
  values: Record<string, number>;
  notes: string;
}

const DEFAULT_ACTIVITIES: WellnessActivity[] = [
  { key: "water", label: "Water", emoji: "💧", unit: "glasses", goal: 8, type: "counter", min: 0, max: 20 },
  { key: "sleep", label: "Sleep", emoji: "🌙", unit: "hours", goal: 8, type: "slider", min: 0, max: 14, step: 0.5 },
  { key: "mood", label: "Mood", emoji: "😊", unit: "/10", goal: 10, type: "slider", min: 1, max: 10, step: 1 },
  { key: "exercise", label: "Exercise", emoji: "🏋️", unit: "minutes", goal: 30, type: "number", min: 0, max: 300 },
];

const WATER_UNIT_OPTIONS = ["glasses", "ml", "liters", "bottles"];
const SLEEP_UNIT_OPTIONS = ["hours", "minutes"];

const PersonalSpace = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<WellnessActivity[]>(DEFAULT_ACTIVITIES);
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);
  const [todayId, setTodayId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ label: "", emoji: "⭐", unit: "", goal: "10", type: "number" as WellnessActivity["type"] });
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const loadData = useCallback(() => {
    if (!user) return;
    setLoading(true);

    // Load activities config
    const savedActivities = localStorage.getItem(`wellness-activities-${user.id}`);
    const acts: WellnessActivity[] = savedActivities ? JSON.parse(savedActivities) : DEFAULT_ACTIVITIES;
    setActivities(acts);

    // Init values
    const initValues: Record<string, number> = {};
    acts.forEach((a) => { initValues[a.key] = a.type === "slider" ? (a.min || 0) : 0; });

    // Load logs
    const stored = localStorage.getItem(`wellness-v2-${user.id}`);
    if (stored) {
      const parsed: WellnessLog[] = JSON.parse(stored);
      setLogs(parsed);
      const today = parsed.find((l) => l.date === todayStr);
      if (today) {
        setValues({ ...initValues, ...today.values });
        setNotes(today.notes);
        setTodayLogged(true);
        setTodayId(today.id);
      } else {
        setValues(initValues);
      }
    } else {
      setValues(initValues);
    }
    setLoading(false);
  }, [user, todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveActivities = (acts: WellnessActivity[]) => {
    if (!user) return;
    setActivities(acts);
    localStorage.setItem(`wellness-activities-${user.id}`, JSON.stringify(acts));
  };

  const saveLogs = (updatedLogs: WellnessLog[]) => {
    if (!user) return;
    localStorage.setItem(`wellness-v2-${user.id}`, JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
  };

  const handleSaveToday = () => {
    const entry: WellnessLog = {
      id: todayId || crypto.randomUUID(),
      date: todayStr,
      values,
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

  const handleAddActivity = () => {
    if (!newActivity.label.trim()) return;
    const key = newActivity.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const act: WellnessActivity = {
      key,
      label: newActivity.label,
      emoji: newActivity.emoji || "⭐",
      unit: newActivity.unit || "units",
      goal: parseFloat(newActivity.goal) || 10,
      type: newActivity.type,
      min: 0,
      max: newActivity.type === "slider" ? parseFloat(newActivity.goal) || 10 : 999,
      step: newActivity.type === "slider" ? 1 : undefined,
    };
    const updated = [...activities, act];
    saveActivities(updated);
    setValues((v) => ({ ...v, [key]: 0 }));
    setNewActivity({ label: "", emoji: "⭐", unit: "", goal: "10", type: "number" });
    setShowAddActivity(false);
    toast.success(`${act.label} added!`);
  };

  const handleRemoveActivity = (key: string) => {
    const updated = activities.filter((a) => a.key !== key);
    saveActivities(updated);
    setValues((v) => { const next = { ...v }; delete next[key]; return next; });
  };

  const handleUpdateGoal = (key: string, goal: number) => {
    const updated = activities.map((a) => a.key === key ? { ...a, goal } : a);
    saveActivities(updated);
  };

  const handleUpdateUnit = (key: string, unit: string) => {
    const updated = activities.map((a) => a.key === key ? { ...a, unit } : a);
    saveActivities(updated);
  };

  const setValue = (key: string, val: number) => setValues((v) => ({ ...v, [key]: val }));

  // Weekly chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dateStr = format(day, "yyyy-MM-dd");
    const log = logs.find((l) => l.date === dateStr);
    const row: Record<string, any> = { day: format(day, "EEE") };
    activities.forEach((a) => { row[a.key] = log?.values?.[a.key] || 0; });
    return row;
  });

  const moodVal = values.mood || 5;
  const moodEmoji = moodVal >= 9 ? "🤩" : moodVal >= 7 ? "😊" : moodVal >= 5 ? "😐" : moodVal >= 3 ? "😔" : "😢";

  const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--primary))", "hsl(var(--destructive))"];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-float text-4xl">💚</div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Personal Space</h1>
          <p className="text-muted-foreground">Track your daily wellness — customize it your way</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowSettings((s) => !s)}>
          <Settings className="h-3.5 w-3.5" /> Customize
        </Button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <Card className="border-border/50 bg-card/90">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Your Activities</h3>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddActivity(true)}>
                <Plus className="h-3 w-3" /> Add Activity
              </Button>
            </div>
            {activities.map((a) => (
              <div key={a.key} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{a.emoji}</span>
                <span className="flex-1 font-medium text-foreground">{a.label}</span>
                <div className="flex items-center gap-1">
                  <Label className="text-[10px]">Goal:</Label>
                  <Input type="number" value={a.goal} onChange={(e) => handleUpdateGoal(a.key, parseFloat(e.target.value) || 1)} className="w-16 h-7 text-xs" />
                </div>
                {(a.key === "water") && (
                  <Select value={a.unit} onValueChange={(v) => handleUpdateUnit(a.key, v)}>
                    <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WATER_UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                {(a.key === "sleep") && (
                  <Select value={a.unit} onValueChange={(v) => handleUpdateUnit(a.key, v)}>
                    <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SLEEP_UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                {!["water", "sleep", "mood"].includes(a.key) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveActivity(a.key)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add New Activity</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newActivity.label} onChange={(e) => setNewActivity((a) => ({ ...a, label: e.target.value }))} placeholder="e.g. Reading, Meditation..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Emoji</Label><Input value={newActivity.emoji} onChange={(e) => setNewActivity((a) => ({ ...a, emoji: e.target.value }))} placeholder="⭐" /></div>
              <div><Label>Unit</Label><Input value={newActivity.unit} onChange={(e) => setNewActivity((a) => ({ ...a, unit: e.target.value }))} placeholder="pages, mins..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Goal</Label><Input type="number" value={newActivity.goal} onChange={(e) => setNewActivity((a) => ({ ...a, goal: e.target.value }))} /></div>
              <div><Label>Input Type</Label>
                <Select value={newActivity.type} onValueChange={(v: any) => setNewActivity((a) => ({ ...a, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="counter">Counter (+1 button)</SelectItem>
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="number">Number input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddActivity} className="w-full">Add Activity</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's tracker */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activities.map((act) => {
          const val = values[act.key] || 0;
          const percent = Math.min(100, (val / act.goal) * 100);
          const isMood = act.key === "mood";

          return (
            <Card key={act.key} className="border-border/50 bg-card/90 overflow-hidden">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 text-3xl">{isMood ? moodEmoji : act.emoji}</div>
                <p className="text-3xl font-bold text-foreground">
                  {isMood ? `${val}/10` : val}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isMood ? "How you feel" : `of ${act.goal} ${act.unit}`}
                </p>
                <Progress value={percent} className="mt-2 h-2" />
                <div className="mt-3">
                  {act.type === "counter" && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setValue(act.key, val + 1)}>
                      <Plus className="h-3 w-3" /> Add {act.unit === "glasses" ? "Glass" : act.unit === "bottles" ? "Bottle" : "1"}
                    </Button>
                  )}
                  {act.type === "slider" && (
                    <Slider value={[val]} onValueChange={([v]) => setValue(act.key, v)} min={act.min || 0} max={act.max || 10} step={act.step || 1} className="w-full" />
                  )}
                  {act.type === "number" && (
                    <Input type="number" value={val} onChange={(e) => setValue(act.key, parseInt(e.target.value) || 0)} min={0} className="text-center" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
          {activities.map((act, idx) => (
            <Card key={act.key} className="border-border/50 bg-card/90">
              <CardContent className="p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{act.emoji}</span> {act.label}
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={weekData}>
                    <defs>
                      <linearGradient id={`grad-${act.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                        <p>{payload[0].value} {act.unit}</p>
                      </div>
                    ) : null} />
                    <Area type="monotone" dataKey={act.key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={`url(#grad-${act.key})`} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalSpace;
