export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          grade: string | null
          id: string
          priority: string
          status: string
          subject: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          grade?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          grade?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          created_at: string
          description: string | null
          genre: string
          id: string
          photo_url: string | null
          rating: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string
          created_at?: string
          description?: string | null
          genre?: string
          id?: string
          photo_url?: string | null
          rating?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          description?: string | null
          genre?: string
          id?: string
          photo_url?: string | null
          rating?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      class_schedule: {
        Row: {
          color: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          location: string | null
          professor: string | null
          start_time: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          location?: string | null
          professor?: string | null
          start_time: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          location?: string | null
          professor?: string | null
          start_time?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          exam_date: string
          exam_time: string | null
          exam_type: string
          id: string
          location: string | null
          max_score: number | null
          notes: string | null
          score: number | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          exam_time?: string | null
          exam_type?: string
          id?: string
          location?: string | null
          max_score?: number | null
          notes?: string | null
          score?: number | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          exam_time?: string | null
          exam_type?: string
          id?: string
          location?: string | null
          max_score?: number | null
          notes?: string | null
          score?: number | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          progress: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gpa_records: {
        Row: {
          created_at: string
          credits: number
          grade_point: number
          id: string
          semester: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          grade_point?: number
          id?: string
          semester: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          grade_point?: number
          id?: string
          semester?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          count: number | null
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          date?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string
          frequency: string
          icon: string | null
          id: string
          name: string
          target_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          frequency?: string
          icon?: string | null
          id?: string
          name: string
          target_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          frequency?: string
          icon?: string | null
          id?: string
          name?: string
          target_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          mood: string
          photo_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          date?: string
          id?: string
          mood: string
          photo_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          mood?: string
          photo_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fat: number | null
          id: string
          meal_type: string
          name: string
          protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          meal_type?: string
          name: string
          protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          meal_type?: string
          name?: string
          protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed: boolean | null
          created_at: string
          due_date: string | null
          goal_id: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          goal_id: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          goal_id?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string
          genre: string
          id: string
          poster_url: string | null
          rating: number | null
          review: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          created_at?: string
          genre?: string
          id?: string
          poster_url?: string | null
          rating?: number | null
          review?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          created_at?: string
          genre?: string
          id?: string
          poster_url?: string | null
          rating?: number | null
          review?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          content: string | null
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          subject: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          subject: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          created_at: string
          date: string
          duration_mins: number | null
          id: string
          name: string
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          duration_mins?: number | null
          id?: string
          name: string
          notes?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          duration_mins?: number | null
          id?: string
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
