import { useMemo } from "react";
import { Task } from "@/lib/task-store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Progress } from "@/components/ui/progress";

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
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [tasks, currentDate]);

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/80 p-4 shadow-[var(--shadow-card)]" style={{ backdropFilter: "blur(10px)" }}>
      {/* Today's Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Today's Progress</h3>
          <span className="text-xs text-muted-foreground">
            {todayCompleted}/{todayTotal} tasks
          </span>
        </div>
        <Progress value={todayPercent} className="h-3" />
        <p className="mt-1 text-xs text-muted-foreground">
          {todayPercent === 100 && todayTotal > 0
            ? "🎉 All done! Amazing work!"
            : todayPercent >= 50
            ? "💪 You're making great progress!"
            : todayTotal === 0
            ? "No tasks scheduled for today"
            : "Keep going, you've got this!"}
        </p>
      </div>

      {/* Weekly Bar Chart */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Weekly Trend</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyData} barSize={24}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(0, 0%, 45%)" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
                      <p className="font-medium">{d.completed}/{d.total} completed</p>
                      <p className="text-muted-foreground">{d.percent}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percent === 100 ? "hsl(142, 71%, 45%)" : entry.percent >= 50 ? "hsl(243, 75%, 58%)" : "hsl(0, 0%, 63%)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskCompletionChart;
