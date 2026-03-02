import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Target, CheckCircle2, Circle, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Personal", "Career", "Health", "Education", "Finance", "Creative", "Social"];
const GOAL_COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

interface Goal { id: string; title: string; description: string | null; category: string; target_date: string | null; status: string; progress: number; color: string; }
interface Milestone { id: string; goal_id: string; title: string; completed: boolean; due_date: string | null; }

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState("#6366f1");

  // Milestone form
  const [addingMilestoneFor, setAddingMilestoneFor] = useState<string | null>(null);
  const [msTitle, setMsTitle] = useState("");
  const [msDueDate, setMsDueDate] = useState("");

  const fetchAll = async () => {
    if (!user) return;
    const [g, m] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("milestones").select("*").eq("user_id", user.id),
    ]);
    if (g.data) setGoals(g.data);
    if (m.data) setMilestones(m.data);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const addGoal = async () => {
    if (!user || !title) return;
    await supabase.from("goals").insert({
      user_id: user.id, title, description: description || null, category, color,
      target_date: targetDate || null,
    });
    setTitle(""); setDescription(""); setShowForm(false);
    fetchAll(); toast({ title: "Goal created! 🎯" });
  };

  const deleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    fetchAll();
  };

  const addMilestone = async (goalId: string) => {
    if (!user || !msTitle) return;
    await supabase.from("milestones").insert({
      user_id: user.id, goal_id: goalId, title: msTitle, due_date: msDueDate || null,
    });
    setMsTitle(""); setMsDueDate(""); setAddingMilestoneFor(null);
    fetchAll();
  };

  const toggleMilestone = async (ms: Milestone) => {
    await supabase.from("milestones").update({ completed: !ms.completed }).eq("id", ms.id);
    // Update goal progress
    const goalMs = milestones.filter(m => m.goal_id === ms.goal_id);
    const completed = goalMs.filter(m => m.id === ms.id ? !ms.completed : m.completed).length;
    const progress = goalMs.length > 0 ? Math.round((completed / goalMs.length) * 100) : 0;
    await supabase.from("goals").update({ progress, status: progress >= 100 ? "completed" : "in_progress" }).eq("id", ms.goal_id);
    fetchAll();
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from("milestones").delete().eq("id", id);
    fetchAll();
  };

  const completedGoals = goals.filter(g => g.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🏆 Goals & Vision Board</h1>
          <p className="text-muted-foreground">{completedGoals}/{goals.length} goals achieved</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Set a New Goal</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Goal Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Learn a new language" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Why this goal matters to you..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label>
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>Target Date</Label><Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} /></div>
          </div>
          <div><Label>Color</Label>
            <div className="flex gap-2 mt-1">{GOAL_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`} style={{ backgroundColor: c }} />
            ))}</div>
          </div>
          <Button onClick={addGoal} className="w-full">Create Goal</Button>
        </CardContent></Card>
      )}

      {goals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No goals yet. Dream big and start setting goals! 🌟</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map(goal => {
            const goalMilestones = milestones.filter(m => m.goal_id === goal.id);
            const isCompleted = goal.status === "completed";
            return (
              <Card key={goal.id} className={`overflow-hidden ${isCompleted ? "ring-2 ring-green-500/30" : ""}`}>
                <div className="h-2" style={{ backgroundColor: goal.color }} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isCompleted ? <Trophy className="h-5 w-5 text-yellow-500" /> : <Target className="h-5 w-5" style={{ color: goal.color }} />}
                      <CardTitle className={`text-lg ${isCompleted ? "line-through text-muted-foreground" : ""}`}>{goal.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{goal.category}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress} className="flex-1" />
                    <span className="text-sm font-medium text-foreground">{goal.progress}%</span>
                  </div>
                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">🎯 Target: {format(new Date(goal.target_date), "dd MMM yyyy")}</p>
                  )}

                  {/* Milestones */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestones</p>
                    {goalMilestones.map(ms => (
                      <div key={ms.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <button onClick={() => toggleMilestone(ms)} className="flex items-center gap-2 text-sm">
                          {ms.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                          <span className={ms.completed ? "line-through text-muted-foreground" : "text-foreground"}>{ms.title}</span>
                        </button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMilestone(ms.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    {addingMilestoneFor === goal.id ? (
                      <div className="flex gap-2 mt-1">
                        <Input value={msTitle} onChange={e => setMsTitle(e.target.value)} placeholder="Milestone title" className="text-sm" />
                        <Button size="sm" onClick={() => addMilestone(goal.id)}>Add</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingMilestoneFor(null)}>✕</Button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingMilestoneFor(goal.id)} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <Plus className="h-3 w-3" /> Add milestone
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
