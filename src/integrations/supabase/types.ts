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
          event_id: string | null
          guest_count: number | null
          id: string
          notes: string | null
          package_id: string | null
          paid_amount: number
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          event_date: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          paid_amount?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          event_date?: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          paid_amount?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "vendor_ratings_summary"
            referencedColumns: ["vendor_id"]
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
      content_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          customer_id: string
          event_date: string
          guest_count: number | null
          id: string
          notes: string | null
          theme: string | null
          title: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_id: string
          event_date: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          theme?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_id?: string
          event_date?: string
          guest_count?: number | null
          id?: string
          notes?: string | null
          theme?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          customer_id: string
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          seats: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          seats?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
            referencedRelation: "vendor_ratings_summary"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          platform_fee: number
          reference: string | null
          refund_reason: string | null
          refunded_at: string | null
          released_at: string | null
          released_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          total_charged: number
          updated_at: string
          vat_amount: number
          vendor_id: string
          vendor_net: number
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          platform_fee?: number
          reference?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          released_at?: string | null
          released_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_charged?: number
          updated_at?: string
          vat_amount?: number
          vendor_id: string
          vendor_net?: number
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          platform_fee?: number
          reference?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          released_at?: string | null
          released_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_charged?: number
          updated_at?: string
          vat_amount?: number
          vendor_id?: string
          vendor_net?: number
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bank_info: string | null
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bank_info?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_info?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          auto_release_days: number
          commission_percent: number
          currency: string
          id: string
          updated_at: string
          updated_by: string | null
          vat_percent: number
        }
        Insert: {
          auto_release_days?: number
          commission_percent?: number
          currency?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          vat_percent?: number
        }
        Update: {
          auto_release_days?: number
          commission_percent?: number
          currency?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          vat_percent?: number
        }
        Relationships: []
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
      review_replies: {
        Row: {
          body: string
          created_at: string
          flagged: boolean
          id: string
          review_id: string
          updated_at: string
          vendor_id: string
          vendor_user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          flagged?: boolean
          id?: string
          review_id: string
          updated_at?: string
          vendor_id: string
          vendor_user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          flagged?: boolean
          id?: string
          review_id?: string
          updated_at?: string
          vendor_id?: string
          vendor_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          communication: number
          created_at: string
          customer_id: string
          flagged: boolean
          id: string
          punctuality: number
          quality: number
          rating: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          communication: number
          created_at?: string
          customer_id: string
          flagged?: boolean
          id?: string
          punctuality: number
          quality: number
          rating: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          communication?: number
          created_at?: string
          customer_id?: string
          flagged?: boolean
          id?: string
          punctuality?: number
          quality?: number
          rating?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      timeline_milestones: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          due_date: string
          event_id: string
          id: string
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          due_date: string
          event_id: string
          id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          due_date?: string
          event_id?: string
          id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_milestones_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "vendor_ratings_summary"
            referencedColumns: ["vendor_id"]
          },
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
      vendor_ratings_summary: {
        Row: {
          avg_communication: number | null
          avg_punctuality: number | null
          avg_quality: number | null
          avg_rating: number | null
          completed_bookings: number | null
          reviews_count: number | null
          vendor_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_payment_split: {
        Args: { _amount: number }
        Returns: {
          platform_fee: number
          total: number
          vat: number
          vendor_net: number
        }[]
      }
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
      milestone_status: "pending" | "in_progress" | "done"
      notification_type:
        | "booking_request"
        | "booking_confirmed"
        | "payment_confirmed"
        | "event_reminder"
        | "general"
      package_tier: "basic" | "premium" | "royal"
      payment_method:
        | "mada"
        | "apple_pay"
        | "stc_pay"
        | "credit_card"
        | "tamara"
        | "tabby"
        | "mock"
      payment_status: "held" | "released" | "refunded" | "failed"
      payout_status: "requested" | "approved" | "paid" | "rejected"
      report_reason: "inappropriate" | "spam" | "harassment" | "other"
      report_status: "pending" | "approved" | "removed"
      report_target: "review" | "reply"
      rsvp_status: "pending" | "confirmed" | "declined"
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
      milestone_status: ["pending", "in_progress", "done"],
      notification_type: [
        "booking_request",
        "booking_confirmed",
        "payment_confirmed",
        "event_reminder",
        "general",
      ],
      package_tier: ["basic", "premium", "royal"],
      payment_method: [
        "mada",
        "apple_pay",
        "stc_pay",
        "credit_card",
        "tamara",
        "tabby",
        "mock",
      ],
      payment_status: ["held", "released", "refunded", "failed"],
      payout_status: ["requested", "approved", "paid", "rejected"],
      report_reason: ["inappropriate", "spam", "harassment", "other"],
      report_status: ["pending", "approved", "removed"],
      report_target: ["review", "reply"],
      rsvp_status: ["pending", "confirmed", "declined"],
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
