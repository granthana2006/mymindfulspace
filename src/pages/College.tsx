import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Assignment, ClassSchedule, Exam, StudyNote, GpaRecord,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getClassSchedule, createClassSchedule, deleteClassSchedule,
  getExams, createExam, updateExam, deleteExam,
  getStudyNotes, createStudyNote, deleteStudyNote, uploadStudyFile,
  getGpaRecords, createGpaRecord, deleteGpaRecord,
} from "@/lib/college-store";
import collegeWallpaper from "@/assets/college-wallpaper.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { format, differenceInDays, isPast } from "date-fns";
import { Plus, Trash2, BookOpen, Calendar, GraduationCap, FileText, Timer, Play, Pause, RotateCcw, CheckCircle2, Upload, X, Info } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COLORS = ["hsl(243, 75%, 58%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 50%)", "hsl(270, 95%, 75%)", "hsl(199, 89%, 48%)"];

const College = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [gpa, setGpa] = useState<GpaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [a, s, e, n, g] = await Promise.all([
        getAssignments(user.id), getClassSchedule(user.id),
        getExams(user.id), getStudyNotes(user.id), getGpaRecords(user.id),
      ]);
      setAssignments(a); setSchedule(s); setExams(e); setNotes(n); setGpa(g);
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const tabs = [
    { key: "assignments", label: "Assignments", icon: <BookOpen className="h-4 w-4" /> },
    { key: "schedule", label: "Schedule", icon: <Calendar className="h-4 w-4" /> },
    { key: "exams", label: "Exams", icon: <GraduationCap className="h-4 w-4" /> },
    { key: "notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
    { key: "gpa", label: "GPA", icon: <GraduationCap className="h-4 w-4" /> },
    { key: "timer", label: "Study Timer", icon: <Timer className="h-4 w-4" /> },
  ];

  return (
    <div className="animate-fade-in relative min-h-full">
      <div className="fixed inset-0 -z-10">
        <img src={collegeWallpaper} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/50 dark:bg-background/80 backdrop-blur-[2px] dark:backdrop-blur-sm" />
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">College Corner</h1>
          <p className="text-sm text-muted-foreground">Track assignments, schedule, exams & more</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pending", value: assignments.filter((a) => a.status === "pending").length, emoji: "📝" },
              { label: "Upcoming Exams", value: exams.filter((e) => !isPast(new Date(e.exam_date))).length, emoji: "📅" },
              { label: "Notes", value: notes.length, emoji: "📒" },
              { label: "GPA Records", value: gpa.length, emoji: "🎓" },
            ].map((s) => (
              <Card key={s.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <span className="text-2xl">{s.emoji}</span>
                  <p className="mt-1 text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1 rounded-lg bg-secondary/80 backdrop-blur-sm p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-float text-4xl">🎓</div></div>
        ) : (
          <>
            {tab === "assignments" && <AssignmentsTab assignments={assignments} userId={user?.id || ""} onRefresh={load} />}
            {tab === "schedule" && <ScheduleTab schedule={schedule} userId={user?.id || ""} onRefresh={load} />}
            {tab === "exams" && <ExamsTab exams={exams} userId={user?.id || ""} onRefresh={load} />}
            {tab === "notes" && <NotesTab notes={notes} userId={user?.id || ""} onRefresh={load} />}
            {tab === "gpa" && <GpaTab gpa={gpa} userId={user?.id || ""} onRefresh={load} />}
            {tab === "timer" && <StudyTimerTab />}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Assignments Tab ─────────────────────────────────────────
const AssignmentsTab = ({ assignments, userId, onRefresh }: { assignments: Assignment[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createAssignment({ user_id: userId, title, subject, description: "", due_date: dueDate || null, status: "pending", priority: priority as Assignment["priority"], grade: "" });
    setTitle(""); setSubject(""); setDueDate(""); setPriority("medium"); setOpen(false);
    toast.success("Assignment added"); onRefresh();
  };

  const handleToggle = async (a: Assignment) => {
    await updateAssignment(a.id, { status: a.status === "completed" ? "pending" : "completed" });
    onRefresh();
  };

  const pending = assignments.filter((a) => a.status !== "completed");
  const completed = assignments.filter((a) => a.status === "completed");
  const completionPercent = assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0;

  // Radar chart data by subject (unique visualization)
  const subjectData = Object.entries(
    assignments.reduce((acc, a) => {
      const key = a.subject || "Other";
      if (!acc[key]) acc[key] = { total: 0, done: 0 };
      acc[key].total++;
      if (a.status === "completed") acc[key].done++;
      return acc;
    }, {} as Record<string, { total: number; done: number }>)
  ).map(([name, { total, done }]) => ({ name, total, done, completion: total > 0 ? Math.round((done / total) * 100) : 0 }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Assignments</h2>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={completionPercent} className="h-2 w-32" />
            <span className="text-xs text-muted-foreground">{completionPercent}% done</span>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Math, English..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                <div><Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Radar chart by subject */}
      {subjectData.length > 1 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Subject Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={subjectData} outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis hide domain={[0, 100]} />
                <Radar name="Completion %" dataKey="completion" stroke="hsl(243, 75%, 58%)" fill="hsl(243, 75%, 58%)" fillOpacity={0.3} />
                <Radar name="Total" dataKey="total" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0]?.payload;
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{d.name}</p>
                        <p>{d.done}/{d.total} done ({d.completion}%)</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Single subject: pie chart */}
      {subjectData.length === 1 && assignments.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie data={[{ value: completed.length }, { value: pending.length }]} dataKey="value" innerRadius={22} outerRadius={35} startAngle={90} endAngle={-270}>
                  <Cell fill="hsl(142, 71%, 45%)" />
                  <Cell fill="hsl(var(--border))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              <p className="text-sm font-medium text-foreground">{completed.length}/{assignments.length} completed</p>
              <p className="text-xs text-muted-foreground">{subjectData[0].name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Pending ({pending.length})</h3>
          {pending.map((a) => (
            <Card key={a.id} className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => handleToggle(a)} className="shrink-0 rounded-full border-2 border-muted-foreground/30 p-1 hover:border-primary"><div className="h-3 w-3" /></button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {a.subject && <Badge variant="outline" className="text-[10px]">{a.subject}</Badge>}
                    <Badge variant={a.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{a.priority}</Badge>
                    {a.due_date && (
                      <span className={`text-[10px] ${isPast(new Date(a.due_date)) ? "text-destructive" : "text-muted-foreground"}`}>
                        Due {format(new Date(a.due_date), "MMM d")}
                        {!isPast(new Date(a.due_date)) && ` (${differenceInDays(new Date(a.due_date), new Date())}d)`}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await deleteAssignment(a.id); onRefresh(); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Completed ({completed.length})</h3>
          {completed.map((a) => (
            <Card key={a.id} className="border-border/50 bg-card/80 backdrop-blur-sm opacity-60">
              <CardContent className="flex items-center gap-3 p-3">
                <button onClick={() => handleToggle(a)} className="shrink-0"><CheckCircle2 className="h-5 w-5 text-primary" /></button>
                <p className="flex-1 font-medium text-foreground line-through truncate">{a.title}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await deleteAssignment(a.id); onRefresh(); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {assignments.length === 0 && <EmptyState emoji="📝" text="No assignments yet. Add one to get started!" />}
    </div>
  );
};

// ─── Schedule Tab ────────────────────────────────────────────
const ScheduleTab = ({ schedule, userId, onRefresh }: { schedule: ClassSchedule[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [professor, setProfessor] = useState("");

  const handleAdd = async () => {
    if (!subject.trim()) return;
    await createClassSchedule({ user_id: userId, subject, day_of_week: parseInt(dayOfWeek), start_time: startTime, end_time: endTime, location, professor, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setSubject(""); setLocation(""); setProfessor(""); setOpen(false);
    toast.success("Class added"); onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Weekly Schedule</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Class</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Day</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Start</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div><Label>End</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
              </div>
              <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 101" /></div>
              <div><Label>Professor</Label><Input value={professor} onChange={(e) => setProfessor(e.target.value)} placeholder="Dr. Smith" /></div>
              <Button onClick={handleAdd} className="w-full">Add Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map((day, i) => {
          const dayClasses = schedule.filter((c) => c.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <Card key={day} className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <h3 className="mb-2 text-sm font-semibold text-foreground">{day}</h3>
                {dayClasses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {dayClasses.map((c) => (
                      <div key={c.id} className="rounded-lg p-2 text-xs" style={{ backgroundColor: c.color + "20", borderLeft: `3px solid ${c.color}` }}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{c.subject}</p>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={async () => { await deleteClassSchedule(c.id); onRefresh(); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground">{c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</p>
                        {c.location && <p className="text-muted-foreground">📍 {c.location}</p>}
                        {c.professor && <p className="text-muted-foreground">👨‍🏫 {c.professor}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── Exams Tab ───────────────────────────────────────────────
const ExamsTab = ({ exams, userId, onRefresh }: { exams: Exam[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("midterm");
  const [customType, setCustomType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [location, setLocation] = useState("");

  const handleAdd = async () => {
    if (!subject.trim() || !examDate) return;
    const finalType = examType === "other" ? (customType.trim() || "other") : examType;
    await createExam({ user_id: userId, subject, exam_type: finalType, exam_date: examDate, exam_time: examTime || null, location, notes: "", score: null, max_score: 100 });
    setSubject(""); setExamDate(""); setExamTime(""); setLocation(""); setCustomType(""); setOpen(false);
    toast.success("Exam added"); onRefresh();
  };

  const upcoming = exams.filter((e) => !isPast(new Date(e.exam_date)));
  const past = exams.filter((e) => isPast(new Date(e.exam_date)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Exam Schedule</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Exam</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Exam</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="viva">Viva</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date *</Label><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
              </div>
              {examType === "other" && (
                <div><Label>Custom Type</Label><Input value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Lab test, Presentation..." /></div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Time</Label><Input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)} /></div>
                <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hall A" /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Upcoming ({upcoming.length})</h3>
          {upcoming.map((e) => {
            const daysLeft = differenceInDays(new Date(e.exam_date), new Date());
            return (
              <Card key={e.id} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg ${daysLeft <= 3 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    <span className="text-lg font-bold">{daysLeft}</span>
                    <span className="text-[9px]">days</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{e.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] capitalize">{e.exam_type}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(e.exam_date), "MMM d, yyyy")}</span>
                      {e.exam_time && <span className="text-xs text-muted-foreground">{e.exam_time.slice(0, 5)}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await deleteExam(e.id); onRefresh(); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Past ({past.length})</h3>
          {past.map((e) => (
            <Card key={e.id} className="border-border/50 bg-card/80 backdrop-blur-sm opacity-60">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{e.subject} — <span className="capitalize text-muted-foreground">{e.exam_type}</span></p>
                  <span className="text-xs text-muted-foreground">{format(new Date(e.exam_date), "MMM d, yyyy")}</span>
                  {e.score !== null && <span className="ml-2 text-xs text-primary font-medium">{e.score}/{e.max_score}</span>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await deleteExam(e.id); onRefresh(); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {exams.length === 0 && <EmptyState emoji="📅" text="No exams scheduled. Add one to track your exam dates!" />}
    </div>
  );
};

// ─── Notes Tab ───────────────────────────────────────────────
const NotesTab = ({ notes, userId, onRefresh }: { notes: StudyNote[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setUploading(true);
    let fileUrl = "";
    let fileName = "";
    if (file) {
      const url = await uploadStudyFile(file);
      if (url) { fileUrl = url; fileName = file.name; }
    }
    await createStudyNote({ user_id: userId, title, subject, content, tags: [], file_url: fileUrl, file_name: fileName });
    setTitle(""); setSubject(""); setContent(""); setFile(null); setOpen(false);
    setUploading(false);
    toast.success("Note saved"); onRefresh();
  };

  const subjects = [...new Set(notes.map((n) => n.subject).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Study Notes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Note</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 5 Summary" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" /></div>
              <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes..." rows={6} /></div>
              <div>
                <Label>Attach File</Label>
                <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <Upload className="h-4 w-4" />
                  {file ? file.name : "Click to upload a file (PDF, DOCX, images...)"}
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
                {file && (
                  <button onClick={() => setFile(null)} className="mt-1 flex items-center gap-1 text-xs text-destructive hover:underline">
                    <X className="h-3 w-3" /> Remove file
                  </button>
                )}
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : "Save Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <Badge key={s} variant="outline" className="text-xs">{s} ({notes.filter((n) => n.subject === s).length})</Badge>
          ))}
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState emoji="📒" text="No notes yet. Start taking notes for your subjects!" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <Card key={n.id} className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{n.title}</h3>
                    {n.subject && <Badge variant="outline" className="text-[10px] mt-1">{n.subject}</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={async () => { await deleteStudyNote(n.id); onRefresh(); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {n.content && <p className="mt-2 text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">{n.content}</p>}
                {(n as any).file_url && (
                  <a href={(n as any).file_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                    <FileText className="h-3 w-3" /> {(n as any).file_name || "Attached file"}
                  </a>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">{format(new Date(n.updated_at), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── GPA Tab ─────────────────────────────────────────────────
const GPA_GUIDE_4 = [
  { grade: "A+/O", range: "90-100%", gp: "4.0" },
  { grade: "A", range: "80-89%", gp: "3.7-4.0" },
  { grade: "B+", range: "70-79%", gp: "3.3" },
  { grade: "B", range: "60-69%", gp: "3.0" },
  { grade: "C+", range: "50-59%", gp: "2.3" },
  { grade: "C", range: "40-49%", gp: "2.0" },
  { grade: "F", range: "<40%", gp: "0" },
];

const GPA_GUIDE_10 = [
  { grade: "O (Outstanding)", range: "90-100%", gp: "10" },
  { grade: "A+ (Excellent)", range: "80-89%", gp: "9" },
  { grade: "A (Very Good)", range: "70-79%", gp: "8" },
  { grade: "B+ (Good)", range: "60-69%", gp: "7" },
  { grade: "B (Above Avg)", range: "55-59%", gp: "6" },
  { grade: "C (Average)", range: "50-54%", gp: "5" },
  { grade: "P (Pass)", range: "40-49%", gp: "4" },
  { grade: "F (Fail)", range: "<40%", gp: "0" },
];

const GpaTab = ({ gpa, userId, onRefresh }: { gpa: GpaRecord[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [semester, setSemester] = useState("");
  const [scale, setScale] = useState<"4" | "10">("10");
  const [subjects, setSubjects] = useState<{ subject: string; credits: string; gradePoint: string }[]>([
    { subject: "", credits: "3", gradePoint: "" },
  ]);

  const addSubjectRow = () => setSubjects((s) => [...s, { subject: "", credits: "3", gradePoint: "" }]);
  const removeSubjectRow = (idx: number) => setSubjects((s) => s.filter((_, i) => i !== idx));
  const updateSubjectRow = (idx: number, field: string, value: string) =>
    setSubjects((s) => s.map((row, i) => i === idx ? { ...row, [field]: value } : row));

  const handleAdd = async () => {
    if (!semester.trim()) { toast.error("Please enter a semester name"); return; }
    const validSubjects = subjects.filter((s) => s.subject.trim() && s.gradePoint !== "");
    if (validSubjects.length === 0) { toast.error("Please add at least one subject with a grade point"); return; }

    const maxGP = scale === "4" ? 4 : 10;
    for (const s of validSubjects) {
      const gp = parseFloat(s.gradePoint);
      const cr = parseFloat(s.credits);
      if (isNaN(gp) || gp < 0 || gp > maxGP) { toast.error(`Grade point for ${s.subject} must be 0-${maxGP}`); return; }
      if (isNaN(cr) || cr <= 0) { toast.error(`Credits for ${s.subject} must be > 0`); return; }
    }

    for (const s of validSubjects) {
      await createGpaRecord({
        user_id: userId,
        semester,
        subject: s.subject,
        credits: parseFloat(s.credits),
        grade_point: parseFloat(s.gradePoint),
      });
    }
    setSubjects([{ subject: "", credits: "3", gradePoint: "" }]);
    setSemester("");
    setOpen(false);
    toast.success(`${validSubjects.length} record(s) added`);
    onRefresh();
  };

  const maxGP = scale === "4" ? 4 : 10;
  const guide = scale === "4" ? GPA_GUIDE_4 : GPA_GUIDE_10;

  const semesters = [...new Set(gpa.map((g) => g.semester))];
  const semesterGpa = semesters.map((s) => {
    const records = gpa.filter((g) => g.semester === s);
    const totalCredits = records.reduce((sum, r) => sum + r.credits, 0);
    const totalPoints = records.reduce((sum, r) => sum + r.credits * r.grade_point, 0);
    return { semester: s, gpa: totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0, records };
  });

  const overallCredits = gpa.reduce((sum, r) => sum + r.credits, 0);
  const overallPoints = gpa.reduce((sum, r) => sum + r.credits * r.grade_point, 0);
  const cgpa = overallCredits > 0 ? (overallPoints / overallCredits).toFixed(2) : "0.00";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">GPA Calculator</h2>
          {gpa.length > 0 && <p className="text-sm text-muted-foreground">CGPA: <span className="font-bold text-primary">{cgpa}</span> / {maxGP}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowGuide((g) => !g)}>
            <Info className="h-3.5 w-3.5" /> Guide
          </Button>
          <div className="flex gap-0.5 rounded-md border border-border p-0.5">
            <button onClick={() => setScale("4")} className={`rounded px-2 py-1 text-[10px] font-medium ${scale === "4" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>0-4</button>
            <button onClick={() => setScale("10")} className={`rounded px-2 py-1 text-[10px] font-medium ${scale === "10" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>0-10</button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Record</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Add GPA Records ({scale === "4" ? "0-4 Scale" : "0-10 Scale"})</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Semester *</Label><Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Fall 2025" /></div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Subjects</Label>
                    <button onClick={addSubjectRow} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="h-3 w-3" /> Add Subject
                    </button>
                  </div>
                  <div className="grid grid-cols-[1fr_60px_60px_32px] gap-1 text-[10px] text-muted-foreground px-1">
                    <span>Subject</span><span>Credits</span><span>GP (0-{maxGP})</span><span></span>
                  </div>
                  {subjects.map((s, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_60px_32px] gap-1 items-end">
                      <Input value={s.subject} onChange={(e) => updateSubjectRow(i, "subject", e.target.value)} placeholder="Subject" />
                      <Input type="number" value={s.credits} onChange={(e) => updateSubjectRow(i, "credits", e.target.value)} min="1" max="8" />
                      <Input type="number" value={s.gradePoint} onChange={(e) => updateSubjectRow(i, "gradePoint", e.target.value)} min="0" max={maxGP} step="0.1" placeholder="GP" />
                      {subjects.length > 1 ? (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeSubjectRow(i)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      ) : <div />}
                    </div>
                  ))}
                </div>

                <Button onClick={handleAdd} className="w-full">Add All Records</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* GPA Guide */}
      {showGuide && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" /> Grade → Grade Point Reference ({scale === "4" ? "0-4" : "0-10"} Scale)
            </h3>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <span className="font-medium text-muted-foreground">Grade</span>
              <span className="font-medium text-muted-foreground">Marks %</span>
              <span className="font-medium text-muted-foreground">Grade Point</span>
              {guide.map((g) => (
                <React.Fragment key={g.grade}>
                  <span className="text-foreground">{g.grade}</span>
                  <span className="text-muted-foreground">{g.range}</span>
                  <span className="font-medium text-primary">{g.gp}</span>
                </React.Fragment>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              CGPA = Σ(Credits × Grade Point) / Σ(Credits)
            </p>
          </CardContent>
        </Card>
      )}

      {semesterGpa.length > 1 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">GPA Trend</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={semesterGpa}>
                <XAxis dataKey="semester" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, maxGP]} hide />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.[0]) return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">GPA: {payload[0].value}/{maxGP}</p>
                    </div>
                  );
                  return null;
                }} />
                <Line type="monotone" dataKey="gpa" stroke="hsl(243, 75%, 58%)" strokeWidth={2} dot={{ fill: "hsl(243, 75%, 58%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {semesterGpa.length === 0 ? (
        <EmptyState emoji="🎓" text="No GPA records yet. Add your courses and grades!" />
      ) : (
        semesterGpa.map((s) => (
          <Card key={s.semester} className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{s.semester}</h3>
                <Badge variant="default" className="text-xs">GPA: {s.gpa}/{maxGP}</Badge>
              </div>
              <div className="space-y-1">
                {s.records.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{r.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{r.credits} cr · {r.grade_point} GP</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={async () => { await deleteGpaRecord(r.id); onRefresh(); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// ─── Study Timer Tab (background-safe) ───────────────────────
const TIMER_KEY = "study-timer-state";

const StudyTimerTab = () => {
  const [mode, setMode] = useState<"stopwatch" | "pomodoro">("pomodoro");
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [displaySeconds, setDisplaySeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [baseSeconds, setBaseSeconds] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      setMode(state.mode);
      setPomodoroTime(state.pomodoroTime);
      setBaseSeconds(state.baseSeconds);
      if (state.running && state.startedAt) {
        setRunning(true);
        setStartedAt(state.startedAt);
      } else {
        setDisplaySeconds(state.displaySeconds);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TIMER_KEY, JSON.stringify({ mode, pomodoroTime, running, startedAt, baseSeconds, displaySeconds }));
  }, [mode, pomodoroTime, running, startedAt, baseSeconds, displaySeconds]);

  useEffect(() => {
    if (!running || !startedAt) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      if (mode === "pomodoro") {
        const remaining = Math.max(0, baseSeconds - elapsed);
        setDisplaySeconds(remaining);
        if (remaining <= 0) { setRunning(false); setStartedAt(null); toast.success("⏰ Pomodoro complete! Take a break!"); }
      } else {
        setDisplaySeconds(baseSeconds + elapsed);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [running, startedAt, baseSeconds, mode]);

  const startTimer = () => { setStartedAt(Date.now()); setBaseSeconds(displaySeconds); setRunning(true); };
  const pauseTimer = () => {
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setBaseSeconds(mode === "pomodoro" ? Math.max(0, baseSeconds - elapsed) : baseSeconds + elapsed);
    }
    setRunning(false); setStartedAt(null);
  };
  const resetTimer = () => { setRunning(false); setStartedAt(null); const val = mode === "pomodoro" ? pomodoroTime * 60 : 0; setBaseSeconds(val); setDisplaySeconds(val); };
  const switchMode = (m: "pomodoro" | "stopwatch") => { setRunning(false); setStartedAt(null); setMode(m); const val = m === "pomodoro" ? pomodoroTime * 60 : 0; setBaseSeconds(val); setDisplaySeconds(val); };
  const selectPomodoro = (m: number) => { setPomodoroTime(m); setRunning(false); setStartedAt(null); setBaseSeconds(m * 60); setDisplaySeconds(m * 60); };
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const progress = mode === "pomodoro" ? ((pomodoroTime * 60 - displaySeconds) / (pomodoroTime * 60)) * 100 : 0;

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <div className="flex gap-1 rounded-lg border border-border p-1">
        <button onClick={() => switchMode("pomodoro")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${mode === "pomodoro" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Pomodoro</button>
        <button onClick={() => switchMode("stopwatch")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${mode === "stopwatch" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Stopwatch</button>
      </div>
      {mode === "pomodoro" && (
        <div className="flex items-center gap-2">
          {[15, 25, 45, 60].map((m) => (
            <button key={m} onClick={() => selectPomodoro(m)} className={`rounded-full px-3 py-1 text-xs ${pomodoroTime === m ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{m}m</button>
          ))}
        </div>
      )}
      <div className="relative flex h-48 w-48 items-center justify-center">
        {mode === "pomodoro" && (
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
              strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
              strokeDashoffset="70" strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
        )}
        <span className="font-mono text-4xl font-bold text-foreground">{formatTime(displaySeconds)}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={resetTimer}><RotateCcw className="h-4 w-4" /></Button>
        <Button size="lg" onClick={running ? pauseTimer : startTimer} className="gap-2 px-8">
          {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {displaySeconds === 0 && mode === "pomodoro" ? "Start" : "Resume"}</>}
        </Button>
      </div>
      {running && <p className="text-xs text-muted-foreground animate-pulse">⏱️ Timer runs even when you switch tabs</p>}
    </div>
  );
};

// ─── Shared ──────────────────────────────────────────────────
const EmptyState = ({ emoji, text }: { emoji: string; text: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 backdrop-blur-sm p-16 text-center">
    <span className="mb-4 text-4xl">{emoji}</span>
    <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
  </div>
);

export default College;
