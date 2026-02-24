import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, ListTodo } from "lucide-react";
import { getTasks, Task } from "@/lib/task-store";
import PlannerView from "@/components/planner/PlannerView";
import TaskItem from "@/components/planner/TaskItem";
import AddTaskForm from "@/components/planner/AddTaskForm";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";

type ViewMode = "daily" | "weekly" | "monthly";
type Tab = "planner" | "todos";

const Planner = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tab, setTab] = useState<Tab>("planner");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const navigate = (dir: "prev" | "next") => {
    const fn = dir === "next"
      ? viewMode === "daily" ? addDays : viewMode === "weekly" ? addWeeks : addMonths
      : viewMode === "daily" ? subDays : viewMode === "weekly" ? subWeeks : subMonths;
    setCurrentDate((d) => fn(d, 1));
  };

  const dateLabel =
    viewMode === "daily"
      ? format(currentDate, "EEEE, MMMM d, yyyy")
      : viewMode === "weekly"
      ? `Week of ${format(currentDate, "MMMM d, yyyy")}`
      : format(currentDate, "MMMM yyyy");

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Planner</h1>
        <p className="text-muted-foreground">Organize your tasks and plan your days</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        <button
          onClick={() => setTab("planner")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "planner" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Planner
        </button>
        <button
          onClick={() => setTab("todos")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "todos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          All Tasks
          {incompleteTasks.length > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 text-xs text-primary">{incompleteTasks.length}</span>
          )}
        </button>
      </div>

      {tab === "planner" && (
        <>
          {/* View mode + navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {(["daily", "weekly", "monthly"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    viewMode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate("prev")} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Today
              </button>
              <button onClick={() => navigate("next")} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-muted-foreground">{dateLabel}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-float text-4xl">📋</div>
            </div>
          ) : (
            <PlannerView tasks={tasks} view={viewMode} currentDate={currentDate} onRefresh={loadTasks} />
          )}
        </>
      )}

      {tab === "todos" && (
        <div className="space-y-4">
          <AddTaskForm onTaskAdded={loadTasks} />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-float text-4xl">📋</div>
            </div>
          ) : (
            <>
              {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
                  <div className="mb-4 text-5xl">✅</div>
                  <h3 className="font-semibold text-foreground">No tasks yet</h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">Add your first task above to get started.</p>
                </div>
              ) : (
                <>
                  {incompleteTasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        To Do ({incompleteTasks.length})
                      </h3>
                      {incompleteTasks.map((t) => <TaskItem key={t.id} task={t} onUpdate={loadTasks} />)}
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Completed ({completedTasks.length})
                      </h3>
                      {completedTasks.map((t) => <TaskItem key={t.id} task={t} onUpdate={loadTasks} />)}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Planner;
