import { supabase } from "@/integrations/supabase/client";
import { signMany } from "./storage-utils";

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  grade: string;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: string;
  user_id: string;
  subject: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  professor: string;
  color: string;
  created_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  subject: string;
  exam_type: string;
  exam_date: string;
  exam_time: string | null;
  location: string;
  notes: string;
  score: number | null;
  max_score: number;
  created_at: string;
}

export interface StudyNote {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  content: string;
  tags: string[];
  file_url: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export interface GpaRecord {
  id: string;
  user_id: string;
  semester: string;
  subject: string;
  credits: number;
  grade_point: number;
  created_at: string;
}

// Assignments
export async function getAssignments(userId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Assignment[];
}

export async function createAssignment(a: Omit<Assignment, "id" | "created_at" | "updated_at">): Promise<void> {
  const { error } = await supabase.from("assignments").insert(a);
  if (error) throw error;
}

export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<void> {
  const { error } = await supabase.from("assignments").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteAssignment(id: string): Promise<void> {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

// Class Schedule
export async function getClassSchedule(userId: string): Promise<ClassSchedule[]> {
  const { data, error } = await supabase
    .from("class_schedule")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ClassSchedule[];
}

export async function createClassSchedule(c: Omit<ClassSchedule, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("class_schedule").insert(c);
  if (error) throw error;
}

export async function deleteClassSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("class_schedule").delete().eq("id", id);
  if (error) throw error;
}

// Exams
export async function getExams(userId: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", userId)
    .order("exam_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Exam[];
}

export async function createExam(e: Omit<Exam, "id" | "created_at" | "updated_at">): Promise<void> {
  const { error } = await supabase.from("exams").insert(e);
  if (error) throw error;
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<void> {
  const { error } = await supabase.from("exams").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
}

// Study Notes
export async function getStudyNotes(userId: string): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from("study_notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as StudyNote[];
}

export async function createStudyNote(n: Omit<StudyNote, "id" | "created_at" | "updated_at">): Promise<void> {
  const { error } = await supabase.from("study_notes").insert(n);
  if (error) throw error;
}

export async function updateStudyNote(id: string, updates: Partial<StudyNote>): Promise<void> {
  const { error } = await supabase.from("study_notes").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteStudyNote(id: string): Promise<void> {
  const { error } = await supabase.from("study_notes").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadStudyFile(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("study-files")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("study-files")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// GPA Records
export async function getGpaRecords(userId: string): Promise<GpaRecord[]> {
  const { data, error } = await supabase
    .from("gpa_records")
    .select("*")
    .eq("user_id", userId)
    .order("semester", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as GpaRecord[];
}

export async function createGpaRecord(g: Omit<GpaRecord, "id" | "created_at" | "updated_at">): Promise<void> {
  const { error } = await supabase.from("gpa_records").insert(g);
  if (error) throw error;
}

export async function deleteGpaRecord(id: string): Promise<void> {
  const { error } = await supabase.from("gpa_records").delete().eq("id", id);
  if (error) throw error;
}
