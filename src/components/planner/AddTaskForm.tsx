import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/task-store";

interface AddTaskFormProps {
  defaultDate?: string;
  onTaskAdded: () => void;
}

const AddTaskForm = ({ defaultDate, onTaskAdded }: AddTaskFormProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || "");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await createTask({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      due_time: dueTime || null,
      priority,
    });
    setTitle("");
    setDescription("");
    setDueDate(defaultDate || "");
    setDueTime("");
    setPriority("medium");
    setOpen(false);
    setSaving(false);
    onTaskAdded();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">New Task</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />

      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="resize-none"
      />

      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-auto flex-1 min-w-[140px]"
        />
        <Input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="w-auto flex-1 min-w-[120px]"
        />
      </div>

      <div className="flex gap-1">
        {(["low", "medium", "high"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
              priority === p
                ? p === "high"
                  ? "bg-destructive/15 text-destructive"
                  : p === "medium"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || !title.trim()}>
          {saving ? "Saving..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
};

export default AddTaskForm;
