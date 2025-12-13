export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "student" | "admin" | "staff";
          university_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "student" | "admin" | "staff";
          university_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: "LOST" | "FOUND";
          category: "ELECTRONICS" | "CLOTHING" | "ID_CARDS" | "KEYS" | "OTHER";
          location: string | null;
          date_incident: string | null;
          status: "OPEN" | "CLAIMED" | "RESOLVED";
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: "LOST" | "FOUND";
          category: "ELECTRONICS" | "CLOTHING" | "ID_CARDS" | "KEYS" | "OTHER";
          location?: string | null;
          date_incident?: string | null;
          status?: "OPEN" | "CLAIMED" | "RESOLVED";
          image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["items"]["Insert"]>;
      };
      claims: {
        Row: {
          id: string;
          item_id: string;
          claimant_id: string;
          status: "PENDING" | "APPROVED" | "REJECTED";
          proof_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          claimant_id: string;
          status?: "PENDING" | "APPROVED" | "REJECTED";
          proof_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["claims"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Enums: {
      user_role: "student" | "admin" | "staff";
      item_type: "LOST" | "FOUND";
      item_category: "ELECTRONICS" | "CLOTHING" | "ID_CARDS" | "KEYS" | "OTHER";
      item_status: "OPEN" | "CLAIMED" | "RESOLVED";
      claim_status: "PENDING" | "APPROVED" | "REJECTED";
    };
  };
}

