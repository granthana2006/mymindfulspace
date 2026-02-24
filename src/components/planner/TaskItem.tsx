import { Check, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Task, updateTask, deleteTask } from "@/lib/task-store";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

const priorityStyles = {
  high: "border-l-destructive",
  medium: "border-l-primary",
  low: "border-l-muted",
};

const TaskItem = ({ task, onUpdate }: TaskItemProps) => {
  const handleToggle = async () => {
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
        priorityStyles[task.priority]
      } ${task.completed ? "opacity-60" : ""}`}
    >
      {/* Checkbox */}
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

      {/* Content */}
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
          {task.priority === "high" && !task.completed && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              High
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
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
