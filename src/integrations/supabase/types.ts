export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_tagging_rules: {
        Row: {
          confidence_threshold: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          keywords: string[]
          name: string
          tag_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          name: string
          tag_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          name?: string
          tag_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tagging_rules_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_posts: {
        Row: {
          added_at: string | null
          collection_id: string
          id: string
          post_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          id?: string
          post_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_posts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "saved_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          post_id: string
          tag_id: string
          tag_type: Database["public"]["Enums"]["tag_type"] | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          post_id: string
          tag_id: string
          tag_type?: Database["public"]["Enums"]["tag_type"] | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          post_id?: string
          tag_id?: string
          tag_type?: Database["public"]["Enums"]["tag_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "saved_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          author_profile_url: string | null
          content: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          linkedin_post_id: string | null
          notes: string | null
          post_date: string | null
          post_url: string
          read_status: boolean | null
          saved_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          author_profile_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          linkedin_post_id?: string | null
          notes?: string | null
          post_date?: string | null
          post_url: string
          read_status?: boolean | null
          saved_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          author_profile_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          linkedin_post_id?: string | null
          notes?: string | null
          post_date?: string | null
          post_url?: string
          read_status?: boolean | null
          saved_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      post_status: "active" | "archived" | "deleted"
      tag_type: "auto" | "manual" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      post_status: ["active", "archived", "deleted"],
      tag_type: ["auto", "manual", "system"],
    },
  },
} as const
