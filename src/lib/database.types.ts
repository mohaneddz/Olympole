export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "participant" | "viewer";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type EventType = "sport" | "culture" | "ceremony" | "mini_game";
export type EventStatus = "draft" | "scheduled" | "live" | "completed" | "cancelled";
export type MatchStatus = "scheduled" | "live" | "completed";
export type SubmissionStatus = "draft" | "published" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          school: string | null;
          year_of_study: string | null;
          gender: string | null;
          student_id: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          school?: string | null;
          year_of_study?: string | null;
          gender?: string | null;
          student_id?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string;
          school?: string | null;
          year_of_study?: string | null;
          gender?: string | null;
          student_id?: string | null;
          role?: AppRole;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          type: EventType;
          category: string;
          venue: string;
          starts_at: string;
          ends_at: string;
          status: EventStatus;
          description: string | null;
          sport_id: string | null;
          activity_id: string | null;
          show_in_schedule: boolean;
          is_featured: boolean;
          is_registration_open: boolean;
          registration_deadline: string | null;
          max_participants: number | null;
          visibility: "public" | "private";
          current_round: string | null;
          icon_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          type: EventType;
          category: string;
          venue: string;
          starts_at: string;
          ends_at: string;
          status?: EventStatus;
          description?: string | null;
          sport_id?: string | null;
          activity_id?: string | null;
          show_in_schedule?: boolean;
          is_featured?: boolean;
          is_registration_open?: boolean;
          registration_deadline?: string | null;
          max_participants?: number | null;
          visibility?: "public" | "private";
          current_round?: string | null;
          icon_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      activities: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: "collective_sport" | "individual_sport" | "culture";
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: "collective_sport" | "individual_sport" | "culture";
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
      };
      matches: {
        Row: {
          id: string;
          event_id: string;
          sport: string;
          team_a: string;
          team_b: string;
          score_a: number;
          score_b: number;
          status: MatchStatus;
          round: string;
          venue: string;
          starts_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          sport: string;
          team_a: string;
          team_b: string;
          score_a?: number;
          score_b?: number;
          status?: MatchStatus;
          round: string;
          venue: string;
          starts_at: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
      };
      results: {
        Row: {
          id: string;
          event_id: string;
          participant_or_team_name: string;
          placement: number;
          medal: string | null;
          score_summary: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          participant_or_team_name: string;
          placement: number;
          medal?: string | null;
          score_summary?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["results"]["Insert"]>;
      };
      registrations: {
        Row: {
          id: string;
          user_id: string | null;
          profile_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          department_or_school: string;
          category_type: string;
          event_id: string;
          activity_slug: string | null;
          team_name: string | null;
          team_id: string | null;
          additional_notes: string | null;
          emergency_contact: string | null;
          previous_experience: string | null;
          motivation: string | null;
          availability_date: string | null;
          preferred_role: string | null;
          registration_details: Json;
          registration_code: string | null;
          attendance_status: string;
          checked_in_at: string | null;
          status: RegistrationStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          profile_id?: string | null;
          full_name: string;
          email: string;
          phone: string;
          department_or_school: string;
          category_type: string;
          event_id: string;
          activity_slug?: string | null;
          team_name?: string | null;
          team_id?: string | null;
          additional_notes?: string | null;
          emergency_contact?: string | null;
          previous_experience?: string | null;
          motivation?: string | null;
          availability_date?: string | null;
          preferred_role?: string | null;
          registration_details?: Json;
          registration_code?: string | null;
          attendance_status?: string;
          checked_in_at?: string | null;
          status?: RegistrationStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["registrations"]["Insert"]>;
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          predicted_winner: string;
          points_awarded: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          predicted_winner: string;
          points_awarded?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["predictions"]["Insert"]>;
      };
      writing_submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          status: SubmissionStatus;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          status?: SubmissionStatus;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["writing_submissions"]["Insert"]>;
      };
      submission_votes: {
        Row: {
          id: string;
          submission_id: string;
          voter_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          voter_user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["submission_votes"]["Insert"]>;
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          updated_at?: string;
        };
      };
      website_config: {
        Row: {
          id: number;
          registration_enabled: boolean;
          predictions_enabled: boolean;
          fantasy_launch: boolean;
          writing_enabled: boolean;
          live_streaming_enabled: boolean;
          registration_max_events_per_user: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          registration_enabled?: boolean;
          predictions_enabled?: boolean;
          fantasy_launch?: boolean;
          writing_enabled?: boolean;
          live_streaming_enabled?: boolean;
          registration_max_events_per_user?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          registration_enabled?: boolean;
          predictions_enabled?: boolean;
          fantasy_launch?: boolean;
          writing_enabled?: boolean;
          live_streaming_enabled?: boolean;
          registration_max_events_per_user?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_activity_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Insert"]>;
      };
      admin_emails: {
        Row: {
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
        };
      };
    };
  };
}
