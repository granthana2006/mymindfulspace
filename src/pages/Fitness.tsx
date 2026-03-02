import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Dumbbell, Flame, Apple, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const WORKOUT_TYPES = ["Cardio", "Strength", "Yoga", "HIIT", "Swimming", "Cycling", "Walking", "Other"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const COLORS = ["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

interface Workout { id: string; type: string; name: string; duration_mins: number; calories_burned: number; notes: string | null; date: string; }
interface Meal { id: string; meal_type: string; name: string; calories: number; protein: number; carbs: number; fat: number; date: string; }

const Fitness = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [tab, setTab] = useState("workouts");
  const [showForm, setShowForm] = useState(false);

  // Workout form
  const [wType, setWType] = useState("Cardio");
  const [wName, setWName] = useState("");
  const [wDuration, setWDuration] = useState("");
  const [wCalories, setWCalories] = useState("");
  const [wDate, setWDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Meal form
  const [mType, setMType] = useState("Lunch");
  const [mName, setMName] = useState("");
  const [mCalories, setMCalories] = useState("");
  const [mProtein, setMProtein] = useState("");
  const [mCarbs, setMCarbs] = useState("");
  const [mFat, setMFat] = useState("");
  const [mDate, setMDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetch = async () => {
    if (!user) return;
    const [w, m] = await Promise.all([
      supabase.from("workouts").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("meals").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    ]);
    if (w.data) setWorkouts(w.data);
    if (m.data) setMeals(m.data);
  };

  useEffect(() => { fetch(); }, [user]);

  const addWorkout = async () => {
    if (!user || !wName) return;
    await supabase.from("workouts").insert({
      user_id: user.id, type: wType, name: wName, duration_mins: parseInt(wDuration) || 0,
      calories_burned: parseInt(wCalories) || 0, date: wDate,
    });
    setWName(""); setWDuration(""); setWCalories(""); setShowForm(false);
    fetch(); toast({ title: "Workout logged! 💪" });
  };

  const addMeal = async () => {
    if (!user || !mName) return;
    await supabase.from("meals").insert({
      user_id: user.id, meal_type: mType, name: mName, calories: parseInt(mCalories) || 0,
      protein: parseFloat(mProtein) || 0, carbs: parseFloat(mCarbs) || 0, fat: parseFloat(mFat) || 0, date: mDate,
    });
    setMName(""); setMCalories(""); setMProtein(""); setMCarbs(""); setMFat(""); setShowForm(false);
    fetch(); toast({ title: "Meal logged! 🍎" });
  };

  const deleteWorkout = async (id: string) => { await supabase.from("workouts").delete().eq("id", id); fetch(); };
  const deleteMeal = async (id: string) => { await supabase.from("meals").delete().eq("id", id); fetch(); };

  const today = format(new Date(), "yyyy-MM-dd");
  const todayCalsBurned = workouts.filter(w => w.date === today).reduce((s, w) => s + (w.calories_burned || 0), 0);
  const todayCalsEaten = meals.filter(m => m.date === today).reduce((s, m) => s + (m.calories || 0), 0);
  const todayMins = workouts.filter(w => w.date === today).reduce((s, w) => s + (w.duration_mins || 0), 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    return {
      day: format(subDays(new Date(), 6 - i), "EEE"),
      burned: workouts.filter(w => w.date === d).reduce((s, w) => s + (w.calories_burned || 0), 0),
      eaten: meals.filter(m => m.date === d).reduce((s, m) => s + (m.calories || 0), 0),
    };
  });

  const macroData = (() => {
    const todayMeals = meals.filter(m => m.date === today);
    const p = todayMeals.reduce((s, m) => s + Number(m.protein || 0), 0);
    const c = todayMeals.reduce((s, m) => s + Number(m.carbs || 0), 0);
    const f = todayMeals.reduce((s, m) => s + Number(m.fat || 0), 0);
    if (p + c + f === 0) return [];
    return [{ name: "Protein", value: p }, { name: "Carbs", value: c }, { name: "Fat", value: f }];
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🏋️ Fitness & Health</h1>
          <p className="text-muted-foreground">Track workouts & nutrition</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> Log {tab === "workouts" ? "Workout" : "Meal"}</Button>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-orange-500/10 p-3"><Flame className="h-6 w-6 text-orange-500" /></div>
          <div><p className="text-sm text-muted-foreground">Burned Today</p><p className="text-2xl font-bold text-foreground">{todayCalsBurned} cal</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-green-500/10 p-3"><Apple className="h-6 w-6 text-green-500" /></div>
          <div><p className="text-sm text-muted-foreground">Eaten Today</p><p className="text-2xl font-bold text-foreground">{todayCalsEaten} cal</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary/10 p-3"><Clock className="h-6 w-6 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Active Mins</p><p className="text-2xl font-bold text-foreground">{todayMins} min</p></div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="workouts">Workouts</TabsTrigger><TabsTrigger value="meals">Meals</TabsTrigger><TabsTrigger value="stats">Stats</TabsTrigger></TabsList>

        {/* Add Forms */}
        {showForm && tab === "workouts" && (
          <Card className="mt-4"><CardHeader><CardTitle>Log Workout</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label><Select value={wType} onValueChange={setWType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WORKOUT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date</Label><Input type="date" value={wDate} onChange={e => setWDate(e.target.value)} /></div>
            </div>
            <div><Label>Exercise Name</Label><Input value={wName} onChange={e => setWName(e.target.value)} placeholder="e.g. Morning Run" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration (min)</Label><Input type="number" value={wDuration} onChange={e => setWDuration(e.target.value)} /></div>
              <div><Label>Calories Burned</Label><Input type="number" value={wCalories} onChange={e => setWCalories(e.target.value)} /></div>
            </div>
            <Button onClick={addWorkout} className="w-full">Save Workout</Button>
          </CardContent></Card>
        )}

        {showForm && tab === "meals" && (
          <Card className="mt-4"><CardHeader><CardTitle>Log Meal</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Meal Type</Label><Select value={mType} onValueChange={setMType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date</Label><Input type="date" value={mDate} onChange={e => setMDate(e.target.value)} /></div>
            </div>
            <div><Label>Food Name</Label><Input value={mName} onChange={e => setMName(e.target.value)} placeholder="e.g. Grilled Chicken Salad" /></div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><Label>Calories</Label><Input type="number" value={mCalories} onChange={e => setMCalories(e.target.value)} /></div>
              <div><Label>Protein (g)</Label><Input type="number" value={mProtein} onChange={e => setMProtein(e.target.value)} /></div>
              <div><Label>Carbs (g)</Label><Input type="number" value={mCarbs} onChange={e => setMCarbs(e.target.value)} /></div>
              <div><Label>Fat (g)</Label><Input type="number" value={mFat} onChange={e => setMFat(e.target.value)} /></div>
            </div>
            <Button onClick={addMeal} className="w-full">Save Meal</Button>
          </CardContent></Card>
        )}

        <TabsContent value="workouts">
          <div className="space-y-2">
            {workouts.length === 0 ? <p className="py-8 text-center text-muted-foreground">No workouts logged yet</p> :
              workouts.slice(0, 30).map(w => (
                <Card key={w.id}><CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-500/10 p-2"><Dumbbell className="h-4 w-4 text-orange-500" /></div>
                    <div>
                      <p className="font-medium text-foreground">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.type} · {w.duration_mins}min · {w.calories_burned}cal · {format(new Date(w.date), "dd MMM")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteWorkout(w.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent></Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="meals">
          <div className="space-y-2">
            {meals.length === 0 ? <p className="py-8 text-center text-muted-foreground">No meals logged yet</p> :
              meals.slice(0, 30).map(m => (
                <Card key={m.id}><CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-2"><Apple className="h-4 w-4 text-green-500" /></div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.meal_type} · {m.calories}cal · P:{Number(m.protein)}g C:{Number(m.carbs)}g F:{Number(m.fat)}g · {format(new Date(m.date), "dd MMM")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMeal(m.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent></Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>7-Day Calories</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="burned" fill="#f59e0b" name="Burned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eaten" fill="#10b981" name="Eaten" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Today's Macros</CardTitle></CardHeader><CardContent>
              {macroData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart><Pie data={macroData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}g`}>
                    {macroData.map((_, i) => <Cell key={i} fill={["#3b82f6", "#f59e0b", "#f43f5e"][i]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="py-8 text-center text-muted-foreground">Log meals to see macros</p>}
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fitness;
