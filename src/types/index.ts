export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          city: string | null;
          state: string | null;
          ham_callsign: string | null;
          is_volunteer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          city?: string | null;
          state?: string | null;
          ham_callsign?: string | null;
          is_volunteer?: boolean;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          city?: string | null;
          state?: string | null;
          ham_callsign?: string | null;
          is_volunteer?: boolean;
          updated_at?: string;
        };
      };
      missing_persons: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          gender: string | null;
          age: number | null;
          current_status_id: string;
          case_closed: boolean;
          event_id: string;
          reported_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          first_name: string;
          last_name: string;
          gender?: string | null;
          age?: number | null;
          current_status_id?: string;
          case_closed?: boolean;
          event_id: string;
          reported_by: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          gender?: string | null;
          age?: number | null;
          current_status_id?: string;
          case_closed?: boolean;
          event_id?: string;
        };
      };
      status_updates: {
        Row: {
          id: string;
          person_id: string;
          status_id: string;
          last_seen_date: string;
          last_city: string;
          last_state: string;
          notes: string;
          case_closed: boolean;
          reported_by: string;
          created_at: string;
        };
        Insert: {
          person_id: string;
          status_id: string;
          last_seen_date: string;
          last_city: string;
          last_state: string;
          notes: string;
          case_closed?: boolean;
          reported_by: string;
        };
        Update: {
          status_id?: string;
          last_seen_date?: string;
          last_city?: string;
          last_state?: string;
          notes?: string;
          case_closed?: boolean;
        };
      };
      status_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          date: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          date?: string;
          description?: string | null;
        };
      };
    };
  };
}