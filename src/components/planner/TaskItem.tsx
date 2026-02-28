import { Check, Trash2, Clock, AlertTriangle, ArrowDown, ArrowRight } from "lucide-react";
import { Task, updateTask, deleteTask } from "@/lib/task-store";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

const priorityConfig = {
  high: {
    border: "border-l-destructive",
    badge: "bg-destructive/15 text-destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
    label: "High",
  },
  medium: {
    border: "border-l-primary",
    badge: "bg-primary/15 text-primary",
    icon: <ArrowRight className="h-3 w-3" />,
    label: "Medium",
  },
  low: {
    border: "border-l-chart-2",
    badge: "bg-chart-2/15 text-chart-2",
    icon: <ArrowDown className="h-3 w-3" />,
    label: "Low",
  },
};

const playCompletionSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.2); // C6
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

const TaskItem = ({ task, onUpdate }: TaskItemProps) => {
  const config = priorityConfig[task.priority];

  const handleToggle = async () => {
    if (!task.completed) playCompletionSound();
    await updateTask(task.id, { completed: !task.completed });
    onUpdate();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onUpdate();
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border border-border border-l-4 bg-card p-3 transition-all hover:shadow-sm ${
        config.border
      } ${task.completed ? "opacity-60" : ""}`}
    >
      <button
        onClick={handleToggle}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary"
        }`}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground ${task.completed ? "line-through" : ""}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), "MMM d")}
              {task.due_time && ` at ${task.due_time.slice(0, 5)}`}
            </span>
          )}
          {!task.completed && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badge}`}>
              {config.icon}
              {config.label}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TaskItem;
