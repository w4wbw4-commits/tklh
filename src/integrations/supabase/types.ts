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
      booking_checklists: {
        Row: {
          booking_id: string
          category: Database["public"]["Enums"]["checklist_category"]
          created_at: string
          done: boolean
          id: string
          sort_order: number
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          booking_id: string
          category?: Database["public"]["Enums"]["checklist_category"]
          created_at?: string
          done?: boolean
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          booking_id?: string
          category?: Database["public"]["Enums"]["checklist_category"]
          created_at?: string
          done?: boolean
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          attendance_confirmed_at: string | null
          attendance_confirmed_by: string | null
          created_at: string
          customer_id: string
          event_date: string
          event_id: string | null
          guest_count: number | null
          id: string
          notes: string | null
          package_id: string | null
          paid_amount: number
          platform_package_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          attendance_confirmed_at?: string | null
          attendance_confirmed_by?: string | null
          created_at?: string
          customer_id: string
          event_date: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          paid_amount?: number
          platform_package_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          attendance_confirmed_at?: string | null
          attendance_confirmed_by?: string | null
          created_at?: string
          customer_id?: string
          event_date?: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          package_id?: string | null
          paid_amount?: number
          platform_package_id?: string | null
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
            foreignKeyName: "bookings_platform_package_id_fkey"
            columns: ["platform_package_id"]
            isOneToOne: false
            referencedRelation: "platform_packages"
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
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_public"
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
      customer_leads: {
        Row: {
          booking_id: string | null
          contact_email: string | null
          created_at: string
          display_name: string | null
          event_id: string | null
          id: string
          last_contacted_at: string | null
          notes: string | null
          phone: string
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          event_id?: string | null
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone: string
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          event_id?: string | null
          id?: string
          last_contacted_at?: string | null
          notes?: string | null
          phone?: string
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_leads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_leads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_requests: {
        Row: {
          booking_id: string
          created_at: string
          customer_id: string
          details: string | null
          event_id: string | null
          id: string
          kind: Database["public"]["Enums"]["emergency_kind"]
          needs_replacement: boolean
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["emergency_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_id: string
          details?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["emergency_kind"]
          needs_replacement?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_id?: string
          details?: string | null
          event_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["emergency_kind"]
          needs_replacement?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["emergency_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          customer_id: string
          event_date: string
          event_days: number | null
          guest_count: number | null
          id: string
          notes: string | null
          platform_package_id: string | null
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
          event_days?: number | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          platform_package_id?: string | null
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
          event_days?: number | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          platform_package_id?: string | null
          theme?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_platform_package_id_fkey"
            columns: ["platform_package_id"]
            isOneToOne: false
            referencedRelation: "platform_packages"
            referencedColumns: ["id"]
          },
        ]
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
      incident_reports: {
        Row: {
          admin_notes: string | null
          attachments: string[]
          booking_id: string
          created_at: string
          customer_id: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["incident_kind"]
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["incident_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          admin_notes?: string | null
          attachments?: string[]
          booking_id: string
          created_at?: string
          customer_id: string
          description: string
          id?: string
          kind?: Database["public"]["Enums"]["incident_kind"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          admin_notes?: string | null
          attachments?: string[]
          booking_id?: string
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["incident_kind"]
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
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
          approval_status: Database["public"]["Enums"]["approval_status"]
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          includes: string[]
          includes_en: string[]
          name: string
          name_en: string | null
          price: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          tier: Database["public"]["Enums"]["package_tier"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean
          approval_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          includes?: string[]
          includes_en?: string[]
          name: string
          name_en?: string | null
          price: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          tier?: Database["public"]["Enums"]["package_tier"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean
          approval_status?: Database["public"]["Enums"]["approval_status"]
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          includes?: string[]
          includes_en?: string[]
          name?: string
          name_en?: string | null
          price?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
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
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_public"
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
      phone_otp_challenges: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      planner_interest: {
        Row: {
          created_at: string
          details: Json
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          details?: Json
          full_name: string
          id?: string
          phone: string
        }
        Update: {
          created_at?: string
          details?: Json
          full_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      platform_packages: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          eligible_vendor_ids: string[]
          id: string
          includes: string[]
          includes_en: string[]
          media: Json
          name: string
          name_en: string | null
          price: number
          published: boolean
          slots: Json
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          eligible_vendor_ids?: string[]
          id?: string
          includes?: string[]
          includes_en?: string[]
          media?: Json
          name: string
          name_en?: string | null
          price?: number
          published?: boolean
          slots?: Json
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          eligible_vendor_ids?: string[]
          id?: string
          includes?: string[]
          includes_en?: string[]
          media?: Json
          name?: string
          name_en?: string | null
          price?: number
          published?: boolean
          slots?: Json
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
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
          vat_number: string | null
          vat_percent: number
        }
        Insert: {
          auto_release_days?: number
          commission_percent?: number
          currency?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          vat_percent?: number
        }
        Update: {
          auto_release_days?: number
          commission_percent?: number
          currency?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          vat_percent?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contact_email: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          contact_email?: string | null
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
      terms_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          ip_address: string | null
          related_id: string | null
          scope: Database["public"]["Enums"]["terms_scope"]
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          related_id?: string | null
          scope: Database["public"]["Enums"]["terms_scope"]
          user_agent?: string | null
          user_id: string
          version?: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          related_id?: string | null
          scope?: Database["public"]["Enums"]["terms_scope"]
          user_agent?: string | null
          user_id?: string
          version?: string
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
      vendor_applications: {
        Row: {
          city: string | null
          created_at: string
          email: string
          entity_type: Database["public"]["Enums"]["applicant_entity_type"]
          full_name: string
          id: string
          notes: string | null
          phone: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: Database["public"]["Enums"]["vendor_category"]
          status: Database["public"]["Enums"]["vendor_application_status"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          entity_type: Database["public"]["Enums"]["applicant_entity_type"]
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type: Database["public"]["Enums"]["vendor_category"]
          status?: Database["public"]["Enums"]["vendor_application_status"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          entity_type?: Database["public"]["Enums"]["applicant_entity_type"]
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: Database["public"]["Enums"]["vendor_category"]
          status?: Database["public"]["Enums"]["vendor_application_status"]
          updated_at?: string
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
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invoices: {
        Row: {
          booking_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          customer_vat_number: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          source: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          vat_amount: number
          vendor_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_vat_number?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          source?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          vendor_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_vat_number?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          source?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          media_type: Database["public"]["Enums"]["portfolio_media_type"]
          sort_order: number
          updated_at: string
          url: string
          vendor_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["portfolio_media_type"]
          sort_order?: number
          updated_at?: string
          url: string
          vendor_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["portfolio_media_type"]
          sort_order?: number
          updated_at?: string
          url?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_pricing_rules: {
        Row: {
          active: boolean
          adjustment_percent: number
          created_at: string
          end_date: string | null
          id: string
          label: string | null
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          start_date: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          active?: boolean
          adjustment_percent?: number
          created_at?: string
          end_date?: string | null
          id?: string
          label?: string | null
          rule_type: Database["public"]["Enums"]["pricing_rule_type"]
          start_date?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          active?: boolean
          adjustment_percent?: number
          created_at?: string
          end_date?: string | null
          id?: string
          label?: string | null
          rule_type?: Database["public"]["Enums"]["pricing_rule_type"]
          start_date?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          active: boolean
          approval_status: Database["public"]["Enums"]["approval_status"]
          bio: string | null
          bio_en: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          city: string | null
          commercial_register_url: string | null
          created_at: string
          daily_capacity: number
          district: string | null
          district_en: string | null
          extra_services: string[]
          extra_services_en: string[]
          google_maps_url: string | null
          hidden: boolean
          hidden_until: string | null
          iban: string | null
          iban_certificate_url: string | null
          id: string
          men_capacity: number | null
          min_deposit: number
          phone: string | null
          portfolio_urls: string[]
          region: string | null
          region_en: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          starting_price: number
          updated_at: string
          user_id: string
          verified: boolean
          weekday_price: number
          weekend_price: number
          women_capacity: number | null
        }
        Insert: {
          active?: boolean
          approval_status?: Database["public"]["Enums"]["approval_status"]
          bio?: string | null
          bio_en?: string | null
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          commercial_register_url?: string | null
          created_at?: string
          daily_capacity?: number
          district?: string | null
          district_en?: string | null
          extra_services?: string[]
          extra_services_en?: string[]
          google_maps_url?: string | null
          hidden?: boolean
          hidden_until?: string | null
          iban?: string | null
          iban_certificate_url?: string | null
          id?: string
          men_capacity?: number | null
          min_deposit?: number
          phone?: string | null
          portfolio_urls?: string[]
          region?: string | null
          region_en?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starting_price?: number
          updated_at?: string
          user_id: string
          verified?: boolean
          weekday_price?: number
          weekend_price?: number
          women_capacity?: number | null
        }
        Update: {
          active?: boolean
          approval_status?: Database["public"]["Enums"]["approval_status"]
          bio?: string | null
          bio_en?: string | null
          business_name?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          city?: string | null
          commercial_register_url?: string | null
          created_at?: string
          daily_capacity?: number
          district?: string | null
          district_en?: string | null
          extra_services?: string[]
          extra_services_en?: string[]
          google_maps_url?: string | null
          hidden?: boolean
          hidden_until?: string | null
          iban?: string | null
          iban_certificate_url?: string | null
          id?: string
          men_capacity?: number | null
          min_deposit?: number
          phone?: string | null
          portfolio_urls?: string[]
          region?: string | null
          region_en?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          starting_price?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
          weekday_price?: number
          weekend_price?: number
          women_capacity?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      platform_settings_public: {
        Row: {
          currency: string | null
          vat_number: string | null
          vat_percent: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      vendors_public: {
        Row: {
          active: boolean | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          bio: string | null
          bio_en: string | null
          business_name: string | null
          category: Database["public"]["Enums"]["vendor_category"] | null
          city: string | null
          created_at: string | null
          daily_capacity: number | null
          district: string | null
          district_en: string | null
          extra_services: string[] | null
          extra_services_en: string[] | null
          google_maps_url: string | null
          hidden: boolean | null
          hidden_until: string | null
          id: string | null
          men_capacity: number | null
          min_deposit: number | null
          portfolio_urls: string[] | null
          region: string | null
          region_en: string | null
          starting_price: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          weekday_price: number | null
          weekend_price: number | null
          women_capacity: number | null
        }
        Insert: {
          active?: boolean | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          bio?: string | null
          bio_en?: string | null
          business_name?: string | null
          category?: Database["public"]["Enums"]["vendor_category"] | null
          city?: string | null
          created_at?: string | null
          daily_capacity?: number | null
          district?: string | null
          district_en?: string | null
          extra_services?: string[] | null
          extra_services_en?: string[] | null
          google_maps_url?: string | null
          hidden?: boolean | null
          hidden_until?: string | null
          id?: string | null
          men_capacity?: number | null
          min_deposit?: number | null
          portfolio_urls?: string[] | null
          region?: string | null
          region_en?: string | null
          starting_price?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          weekday_price?: number | null
          weekend_price?: number | null
          women_capacity?: number | null
        }
        Update: {
          active?: boolean | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          bio?: string | null
          bio_en?: string | null
          business_name?: string | null
          category?: Database["public"]["Enums"]["vendor_category"] | null
          city?: string | null
          created_at?: string | null
          daily_capacity?: number | null
          district?: string | null
          district_en?: string | null
          extra_services?: string[] | null
          extra_services_en?: string[] | null
          google_maps_url?: string | null
          hidden?: boolean | null
          hidden_until?: string | null
          id?: string | null
          men_capacity?: number | null
          min_deposit?: number | null
          portfolio_urls?: string[] | null
          region?: string | null
          region_en?: string | null
          starting_price?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          weekday_price?: number | null
          weekend_price?: number | null
          women_capacity?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_list_pending_vendor_docs: {
        Args: never
        Returns: {
          business_name: string
          commercial_register_url: string
          iban_certificate_url: string
          id: string
        }[]
      }
      admin_list_pending_vendor_verifications: {
        Args: never
        Returns: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          bio: string
          business_name: string
          category: string
          city: string
          commercial_register_url: string
          created_at: string
          daily_capacity: number
          google_maps_url: string
          iban: string
          iban_certificate_url: string
          id: string
          phone: string
          portfolio_urls: string[]
          rejection_reason: string
          starting_price: number
        }[]
      }
      compute_payment_split: {
        Args: { _amount: number }
        Returns: {
          platform_fee: number
          total: number
          vat: number
          vendor_net: number
        }[]
      }
      generate_vendor_invoice_number: { Args: never; Returns: string }
      get_vendor_private: {
        Args: { _vendor_id: string }
        Returns: {
          commercial_register_url: string
          iban: string
          iban_certificate_url: string
          id: string
          phone: string
          user_id: string
        }[]
      }
      get_vendor_review_replies: {
        Args: { _vendor_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          review_id: string
          updated_at: string
          vendor_id: string
        }[]
      }
      get_vendor_reviews: {
        Args: { _vendor_id: string }
        Returns: {
          comment: string
          communication: number
          created_at: string
          id: string
          punctuality: number
          quality: number
          rating: number
          reviewer_name: string
          vendor_id: string
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
      applicant_entity_type: "company" | "individual"
      approval_status: "pending_approval" | "approved" | "rejected"
      availability_status: "blocked" | "booked" | "pending"
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "completed"
        | "cancelled"
      checklist_category:
        | "catering"
        | "decoration"
        | "staff"
        | "logistics"
        | "other"
      emergency_kind: "delay" | "cancellation" | "no_show" | "other"
      emergency_status: "open" | "in_progress" | "resolved"
      incident_kind:
        | "quality"
        | "no_show"
        | "late"
        | "damage"
        | "safety"
        | "other"
      incident_status: "open" | "in_review" | "resolved" | "dismissed"
      lead_status: "verified" | "planned" | "booked" | "completed" | "lost"
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
      portfolio_media_type: "image" | "video"
      pricing_rule_type: "weekend" | "weekday" | "seasonal"
      report_reason: "inappropriate" | "spam" | "harassment" | "other"
      report_status: "pending" | "approved" | "removed"
      report_target: "review" | "reply"
      rsvp_status: "pending" | "confirmed" | "declined"
      terms_scope: "booking" | "vendor_onboarding"
      vendor_application_status: "new" | "contacted" | "approved" | "rejected"
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
      applicant_entity_type: ["company", "individual"],
      approval_status: ["pending_approval", "approved", "rejected"],
      availability_status: ["blocked", "booked", "pending"],
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
      ],
      checklist_category: [
        "catering",
        "decoration",
        "staff",
        "logistics",
        "other",
      ],
      emergency_kind: ["delay", "cancellation", "no_show", "other"],
      emergency_status: ["open", "in_progress", "resolved"],
      incident_kind: [
        "quality",
        "no_show",
        "late",
        "damage",
        "safety",
        "other",
      ],
      incident_status: ["open", "in_review", "resolved", "dismissed"],
      lead_status: ["verified", "planned", "booked", "completed", "lost"],
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
      portfolio_media_type: ["image", "video"],
      pricing_rule_type: ["weekend", "weekday", "seasonal"],
      report_reason: ["inappropriate", "spam", "harassment", "other"],
      report_status: ["pending", "approved", "removed"],
      report_target: ["review", "reply"],
      rsvp_status: ["pending", "confirmed", "declined"],
      terms_scope: ["booking", "vendor_onboarding"],
      vendor_application_status: ["new", "contacted", "approved", "rejected"],
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
