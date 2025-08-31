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
      claims: {
        Row: {
          id: string
          type: 'IFR' | 'CFR' | 'CR'
          state: string
          village: string
          area: number
          status: 'Pending' | 'Approved' | 'Rejected'
          date: string
          applicantName: string
          tribe: string
          povertyIndex: number
          groundwaterIndex: number
          agriArea: number
          forestDegradation: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          type: 'IFR' | 'CFR' | 'CR'
          state: string
          village: string
          area: number
          status?: 'Pending' | 'Approved' | 'Rejected'
          date: string
          applicantName: string
          tribe: string
          povertyIndex: number
          groundwaterIndex: number
          agriArea: number
          forestDegradation: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'IFR' | 'CFR' | 'CR'
          state?: string
          village?: string
          area?: number
          status?: 'Pending' | 'Approved' | 'Rejected'
          date?: string
          applicantName?: string
          tribe?: string
          povertyIndex?: number
          groundwaterIndex?: number
          agriArea?: number
          forestDegradation?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      schemes: {
        Row: {
          id: string
          name: string
          eligibility: Json
          priority: number
          evidenceKeys: string[]
          weights: Json
          budget: number
          householdsAffected: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          eligibility: Json
          priority: number
          evidenceKeys: string[]
          weights: Json
          budget: number
          householdsAffected: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          eligibility?: Json
          priority?: number
          evidenceKeys?: string[]
          weights?: Json
          budget?: number
          householdsAffected?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          filename: string
          status: 'Pending' | 'Processed' | 'Failed'
          uploadedAt: string
          extractedText: string
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          filename: string
          status?: 'Pending' | 'Processed' | 'Failed'
          uploadedAt: string
          extractedText?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          status?: 'Pending' | 'Processed' | 'Failed'
          uploadedAt?: string
          extractedText?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          role: 'admin' | 'officer'
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          role: 'admin' | 'officer'
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'officer'
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
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

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Claim = Tables<'claims'>
export type Scheme = Tables<'schemes'>
export type Document = Tables<'documents'>
export type User = Tables<'users'>
export type Profile = Tables<'profiles'>

// Insert types
export type ClaimInsert = TablesInsert<'claims'>
export type SchemeInsert = TablesInsert<'schemes'>
export type DocumentInsert = TablesInsert<'documents'>
export type UserInsert = TablesInsert<'users'>

// Update types
export type ClaimUpdate = TablesUpdate<'claims'>
export type SchemeUpdate = TablesUpdate<'schemes'>
export type DocumentUpdate = TablesUpdate<'documents'>
export type UserUpdate = TablesUpdate<'users'>
