export interface UserProfile {
  id: string;
  userId: string;
  dob: Date | null;
  image: string | null;
  username: string | null;
  address: string | null;
  created_at?: string;
  updated_at?: string;
}

// If you're using database types, update them as well:
export type Database = {
  public: {
    Tables: {
      user_profiles: {  // This should match your Supabase table name exactly
        Row: {
          id: string;
          userId: string;
          username: string | null;
          dob: string | null;
          address: string | null;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          userId: string;
          username?: string | null;
          dob?: string | null;
          address?: string | null;
          image?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          username?: string | null;
          dob?: string | null;
          address?: string | null;
          image?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
