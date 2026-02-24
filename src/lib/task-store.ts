import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  created_at: string;
  updated_at: string;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  return (data || []) as Task[];
}

export async function createTask(task: {
  title: string;
  description?: string;
  due_date?: string | null;
  due_time?: string | null;
  priority?: "low" | "medium" | "high";
  category?: string;
}): Promise<Task | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || null,
      due_time: task.due_time || null,
      priority: task.priority || "medium",
      category: task.category || "task",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Omit<Task, "id" | "created_at" | "updated_at">>): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);
  if (error) console.error("Error updating task:", error);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) console.error("Error deleting task:", error);
}
