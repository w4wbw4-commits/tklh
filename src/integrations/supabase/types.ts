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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          event_date: string
          guest_count: number | null
          id: string
          notes: string | null
          package_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          event_date: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          event_date?: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          includes: string[]
          name: string
          price: number
          tier: Database["public"]["Enums"]["package_tier"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          includes?: string[]
          name: string
          price: number
          tier?: Database["public"]["Enums"]["package_tier"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          includes?: string[]
          name?: string
          price?: number
          tier?: Database["public"]["Enums"]["package_tier"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_availability: {
        Row: {
          booking_id: string | null
          created_at: string
          date: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["availability_status"]
          vendor_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          date: string
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["availability_status"]
          vendor_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          active: boolean
          bio: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          city: string | null
          commercial_register_url: string | null
          created_at: string
          daily_capacity: number
          id: string
          phone: string | null
          portfolio_urls: string[]
          starting_price: number
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          bio?: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          commercial_register_url?: string | null
          created_at?: string
          daily_capacity?: number
          id?: string
          phone?: string | null
          portfolio_urls?: string[]
          starting_price?: number
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          bio?: string | null
          business_name?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          commercial_register_url?: string | null
          created_at?: string
          daily_capacity?: number
          id?: string
          phone?: string | null
          portfolio_urls?: string[]
          starting_price?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "vendor" | "admin"
      availability_status: "blocked" | "booked" | "pending"
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "completed"
        | "cancelled"
      notification_type:
        | "booking_request"
        | "booking_confirmed"
        | "payment_confirmed"
        | "event_reminder"
        | "general"
      package_tier: "basic" | "premium" | "royal"
      vendor_category:
        | "hall"
        | "catering"
        | "photography"
        | "dj"
        | "decor"
        | "cars"
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
    Enums: {
      app_role: ["customer", "vendor", "admin"],
      availability_status: ["blocked", "booked", "pending"],
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
      ],
      notification_type: [
        "booking_request",
        "booking_confirmed",
        "payment_confirmed",
        "event_reminder",
        "general",
      ],
      package_tier: ["basic", "premium", "royal"],
      vendor_category: [
        "hall",
        "catering",
        "photography",
        "dj",
        "decor",
        "cars",
      ],
    },
  },
} as const
