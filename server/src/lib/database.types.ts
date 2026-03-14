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
      games: {
        Row: {
          code: string
          created_at: string | null
          host_id: string | null
          id: string
          status: Database["public"]["Enums"]["game_status"]
        }
        Insert: {
          code: string
          created_at?: string | null
          host_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["game_status"]
        }
        Update: {
          code?: string
          created_at?: string | null
          host_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["game_status"]
        }
        Relationships: []
      }
      players: {
        Row: {
          candidate: Json | null
          game_id: string
          id: string
          slot: number | null
          socket_id: string | null
        }
        Insert: {
          candidate?: Json | null
          game_id: string
          id?: string
          slot?: number | null
          socket_id?: string | null
        }
        Update: {
          candidate?: Json | null
          game_id?: string
          id?: string
          slot?: number | null
          socket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          game_id: string
          id: string
          round_number: number
          topic: string | null
          transcript: Json | null
        }
        Insert: {
          game_id: string
          id?: string
          round_number: number
          topic?: string | null
          transcript?: Json | null
        }
        Update: {
          game_id?: string
          id?: string
          round_number?: number
          topic?: string | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rounds_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      voters: {
        Row: {
          game_id: string
          id: string
          profile: Json
          vote: string | null
          vote_reason: string | null
        }
        Insert: {
          game_id: string
          id?: string
          profile: Json
          vote?: string | null
          vote_reason?: string | null
        }
        Update: {
          game_id?: string
          id?: string
          profile?: Json
          vote?: string | null
          vote_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voters_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_status: "lobby" | "reveal" | "debate" | "voting" | "complete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
