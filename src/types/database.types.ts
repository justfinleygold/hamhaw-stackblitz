export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_volunteer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_volunteer?: boolean;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          is_volunteer?: boolean;
          updated_at?: string;
        };
      };
      missing_persons: {
        Row: {
          id: string;
          name: string;
          gender: string | null;
          age: number | null;
          last_seen_date: string;
          last_seen_location: string;
          description: string | null;
          status: 'missing' | 'found' | 'investigating';
          reported_by: string;
          created_at: string;
          updated_at: string;
          event_id: string;
        };
        Insert: {
          name: string;
          gender?: string;
          age?: number | null;
          last_seen_date: string;
          last_seen_location: string;
          description?: string | null;
          status?: 'missing' | 'found' | 'investigating';
          reported_by: string;
          event_id: string;
        };
        Update: {
          name?: string;
          gender?: string;
          age?: number | null;
          last_seen_date?: string;
          last_seen_location?: string;
          description?: string | null;
          status?: 'missing' | 'found' | 'investigating';
          event_id?: string;
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