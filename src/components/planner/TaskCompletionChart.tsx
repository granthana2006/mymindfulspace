import { useMemo } from "react";
import { Task } from "@/lib/task-store";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { CheckCircle2, Circle, Flame, Target, TrendingUp } from "lucide-react";

interface TaskCompletionChartProps {
  tasks: Task[];
  currentDate: Date;
}

const TaskCompletionChart = ({ tasks, currentDate }: TaskCompletionChartProps) => {
  const todayStr = format(currentDate, "yyyy-MM-dd");
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayTotal = todayTasks.length;
  const todayPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(startOfDay(currentDate), 6 - i);
      const dateStr = format(day, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);
      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;
      return {
        day: format(day, "EEE"),
        fullDay: format(day, "MMM d"),
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [tasks, currentDate]);

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(startOfDay(currentDate), i);
      const dateStr = format(day, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);
      if (dayTasks.length === 0) continue;
      if (dayTasks.every((t) => t.completed)) count++;
      else break;
    }
    return count;
  }, [tasks, currentDate]);

  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const overallPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const pieData = [
    { name: "Done", value: todayCompleted },
    { name: "Remaining", value: Math.max(0, todayTotal - todayCompleted) },
  ];

  const getMessage = () => {
    if (todayTotal === 0) return "No tasks today — enjoy the free time! 🏖️";
    if (todayPercent === 100) return "All done! You're on fire! 🔥";
    if (todayPercent >= 75) return "Almost there, keep pushing! 💪";
    if (todayPercent >= 50) return "Halfway there, nice progress! ⚡";
    return "Let's get started! You've got this! 🚀";
  };

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: <Target className="h-5 w-5 text-primary" />, label: "Today", value: `${todayCompleted}/${todayTotal}`, sub: `${todayPercent}%` },
          { icon: <Flame className="h-5 w-5 text-destructive" />, label: "Streak", value: `${streak}`, sub: streak === 1 ? "day" : "days" },
          { icon: <CheckCircle2 className="h-5 w-5 text-chart-2" />, label: "Total Done", value: `${totalCompleted}`, sub: `of ${totalTasks}` },
          { icon: <TrendingUp className="h-5 w-5 text-chart-4" />, label: "Overall", value: `${overallPercent}%`, sub: "completion" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card/80 p-4 text-center backdrop-blur-sm">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50">{s.icon}</div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Today's donut + message */}
      <div className="rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Today's Progress</h3>
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={55} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--border))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{todayPercent}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">{getMessage()}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> {todayCompleted} done</span>
              <span className="flex items-center gap-1"><Circle className="h-3 w-3 text-muted" /> {todayTotal - todayCompleted} left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly trend area chart */}
      <div className="rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Weekly Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                      <p className="font-medium text-foreground">{d.fullDay}</p>
                      <p className="text-muted-foreground">{d.completed}/{d.total} tasks · {d.percent}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="percent" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#completionGrad)" dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskCompletionChart;
