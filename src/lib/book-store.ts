import { supabase } from "@/integrations/supabase/client";
import { signMany, signStorageUrl } from "./storage-utils";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  genre: string;
  status: "tbr" | "reading" | "read";
  rating: number | null;
  description: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export const GENRES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Thriller",
  "Romance",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Biography",
  "Self-Help",
  "Horror",
  "Historical",
  "Poetry",
  "Other",
] as const;

export async function getBooks(userId: string): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const books = (data as unknown as Book[]) ?? [];
  return signMany(books, "book-photos", "photo_url");
}

export async function createBook(book: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book> {
  const { data, error } = await supabase.from("books").insert(book).select().single();
  if (error) throw error;
  const created = data as unknown as Book;
  if (created.photo_url) created.photo_url = await signStorageUrl("book-photos", created.photo_url);
  return created;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  const { data, error } = await supabase.from("books").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as unknown as Book;
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadBookPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("book-photos").upload(path, file);
  if (error) throw error;
  // Store the object path; consumers turn it into a short-lived signed URL on read.
  return path;
}
