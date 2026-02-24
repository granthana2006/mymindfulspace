import { useMemo } from "react";
import { Task } from "@/lib/task-store";
import TaskItem from "./TaskItem";
import AddTaskForm from "./AddTaskForm";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, startOfMonth, endOfMonth, getDay } from "date-fns";

interface PlannerViewProps {
  tasks: Task[];
  view: "daily" | "weekly" | "monthly";
  currentDate: Date;
  onRefresh: () => void;
}

const PlannerView = ({ tasks, view, currentDate, onRefresh }: PlannerViewProps) => {
  if (view === "daily") return <DailyView tasks={tasks} date={currentDate} onRefresh={onRefresh} />;
  if (view === "weekly") return <WeeklyView tasks={tasks} date={currentDate} onRefresh={onRefresh} />;
  return <MonthlyView tasks={tasks} date={currentDate} onRefresh={onRefresh} />;
};

const DailyView = ({ tasks, date, onRefresh }: { tasks: Task[]; date: Date; onRefresh: () => void }) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.due_date === dateStr);
  const noDateTasks = tasks.filter((t) => !t.due_date);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">
        {isToday(date) ? "Today" : format(date, "EEEE, MMMM d")}
      </h3>

      {dayTasks.length === 0 && noDateTasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No tasks for this day</p>
      ) : (
        <div className="space-y-2">
          {dayTasks.map((t) => <TaskItem key={t.id} task={t} onUpdate={onRefresh} />)}
          {noDateTasks.length > 0 && (
            <>
              <p className="pt-2 text-xs font-medium text-muted-foreground">No date assigned</p>
              {noDateTasks.map((t) => <TaskItem key={t.id} task={t} onUpdate={onRefresh} />)}
            </>
          )}
        </div>
      )}

      <AddTaskForm defaultDate={dateStr} onTaskAdded={onRefresh} />
    </div>
  );
};

const WeeklyView = ({ tasks, date, onRefresh }: { tasks: Task[]; date: Date; onRefresh: () => void }) => {
  const days = eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });

  return (
    <div className="space-y-6">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayTasks = tasks.filter((t) => t.due_date === dateStr);

        return (
          <div key={dateStr}>
            <h4 className={`mb-2 text-sm font-semibold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
              {isToday(day) ? "Today" : format(day, "EEE, MMM d")}
              {dayTasks.length > 0 && (
                <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                  {dayTasks.length}
                </span>
              )}
            </h4>
            <div className="space-y-2">
              {dayTasks.map((t) => <TaskItem key={t.id} task={t} onUpdate={onRefresh} />)}
              <AddTaskForm defaultDate={dateStr} onTaskAdded={onRefresh} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MonthlyView = ({ tasks, date, onRefresh }: { tasks: Task[]; date: Date; onRefresh: () => void }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month
  const startDay = getDay(monthStart);
  const padStart = (startDay + 6) % 7; // Monday start

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push(t);
      }
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: padStart }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] rounded-lg" />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[dateStr] || [];
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              className={`min-h-[80px] rounded-lg border p-1.5 transition-colors ${
                today ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span className={`text-xs font-medium ${today ? "text-primary" : "text-foreground"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className={`truncate rounded px-1 py-0.5 text-[10px] ${
                      t.completed
                        ? "bg-muted text-muted-foreground line-through"
                        : t.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskForm defaultDate={format(date, "yyyy-MM-dd")} onTaskAdded={onRefresh} />
    </div>
  );
};

export default PlannerView;
