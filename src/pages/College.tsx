import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Assignment, ClassSchedule, Exam, StudyNote, GpaRecord,
  getAssignments, createAssignment, updateAssignment, deleteAssignment,
  getClassSchedule, createClassSchedule, deleteClassSchedule,
  getExams, createExam, updateExam, deleteExam,
  getStudyNotes, createStudyNote, deleteStudyNote,
  getGpaRecords, createGpaRecord, deleteGpaRecord,
} from "@/lib/college-store";
import collegeWallpaper from "@/assets/college-wallpaper.jpg";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from "recharts";
import { format, differenceInDays, isPast } from "date-fns";
import { Plus, Trash2, BookOpen, Calendar, GraduationCap, FileText, Clock, Timer, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
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
    { key: "gpa", label: "GPA", icon: <BarChart className="h-4 w-4" /> },
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

        {/* Stats summary */}
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

        {/* Tabs */}
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

  // Chart data by subject
  const subjectData = Object.entries(
    assignments.reduce((acc, a) => { acc[a.subject || "Other"] = (acc[a.subject || "Other"] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

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

      {/* Subject distribution chart */}
      {subjectData.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">By Subject</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={subjectData} barSize={20}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [location, setLocation] = useState("");

  const handleAdd = async () => {
    if (!subject.trim() || !examDate) return;
    await createExam({ user_id: userId, subject, exam_type: examType, exam_date: examDate, exam_time: examTime || null, location, notes: "", score: null, max_score: 100 });
    setSubject(""); setExamDate(""); setExamTime(""); setLocation(""); setOpen(false);
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
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date *</Label><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
              </div>
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

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createStudyNote({ user_id: userId, title, subject, content, tags: [] });
    setTitle(""); setSubject(""); setContent(""); setOpen(false);
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
              <Button onClick={handleAdd} className="w-full">Save Note</Button>
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
const GpaTab = ({ gpa, userId, onRefresh }: { gpa: GpaRecord[]; userId: string; onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [credits, setCredits] = useState("3");
  const [gradePoint, setGradePoint] = useState("0");

  const handleAdd = async () => {
    if (!semester.trim() || !subject.trim()) return;
    await createGpaRecord({ user_id: userId, semester, subject, credits: parseFloat(credits), grade_point: parseFloat(gradePoint) });
    setSubject(""); setOpen(false);
    toast.success("GPA record added"); onRefresh();
  };

  // Calculate GPA per semester
  const semesters = [...new Set(gpa.map((g) => g.semester))];
  const semesterGpa = semesters.map((s) => {
    const records = gpa.filter((g) => g.semester === s);
    const totalCredits = records.reduce((sum, r) => sum + r.credits, 0);
    const totalPoints = records.reduce((sum, r) => sum + r.credits * r.grade_point, 0);
    return { semester: s, gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00", records };
  });

  const overallCredits = gpa.reduce((sum, r) => sum + r.credits, 0);
  const overallPoints = gpa.reduce((sum, r) => sum + r.credits * r.grade_point, 0);
  const cgpa = overallCredits > 0 ? (overallPoints / overallCredits).toFixed(2) : "0.00";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">GPA Calculator</h2>
          {gpa.length > 0 && <p className="text-sm text-muted-foreground">CGPA: <span className="font-bold text-primary">{cgpa}</span></p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Record</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add GPA Record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Semester *</Label><Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Fall 2025" /></div>
              <div><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Calculus I" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Credits</Label><Input type="number" value={credits} onChange={(e) => setCredits(e.target.value)} min="1" max="6" /></div>
                <div><Label>Grade Point (0-4)</Label><Input type="number" value={gradePoint} onChange={(e) => setGradePoint(e.target.value)} min="0" max="4" step="0.1" /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* GPA trend chart */}
      {semesterGpa.length > 1 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">GPA Trend</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={semesterGpa}>
                <XAxis dataKey="semester" tick={{ fontSize: 10, fill: "hsl(0,0%,45%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} hide />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.[0]) return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">GPA: {payload[0].value}</p>
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
                <Badge variant="default" className="text-xs">GPA: {s.gpa}</Badge>
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

// ─── Study Timer Tab ─────────────────────────────────────────
const StudyTimerTab = () => {
  const [mode, setMode] = useState<"stopwatch" | "pomodoro">("pomodoro");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (mode === "pomodoro" && s <= 1) {
            setRunning(false);
            toast.success("⏰ Pomodoro complete! Take a break!");
            return 0;
          }
          return mode === "pomodoro" ? s - 1 : s + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const resetTimer = () => {
    setRunning(false);
    setSeconds(mode === "pomodoro" ? pomodoroTime * 60 : 0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = mode === "pomodoro" ? ((pomodoroTime * 60 - seconds) / (pomodoroTime * 60)) * 100 : 0;

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <div className="flex gap-1 rounded-lg border border-border p-1">
        <button onClick={() => { setMode("pomodoro"); setRunning(false); setSeconds(pomodoroTime * 60); }}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${mode === "pomodoro" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Pomodoro
        </button>
        <button onClick={() => { setMode("stopwatch"); setRunning(false); setSeconds(0); }}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${mode === "stopwatch" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Stopwatch
        </button>
      </div>

      {mode === "pomodoro" && (
        <div className="flex items-center gap-2">
          {[15, 25, 45, 60].map((m) => (
            <button key={m} onClick={() => { setPomodoroTime(m); setSeconds(m * 60); setRunning(false); }}
              className={`rounded-full px-3 py-1 text-xs ${pomodoroTime === m ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>
              {m}m
            </button>
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
        <span className="font-mono text-4xl font-bold text-foreground">{formatTime(seconds)}</span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={resetTimer}><RotateCcw className="h-4 w-4" /></Button>
        <Button size="lg" onClick={() => setRunning((r) => !r)} className="gap-2 px-8">
          {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {seconds === 0 && mode === "pomodoro" ? "Start" : "Resume"}</>}
        </Button>
      </div>
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
