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
      administrator: {
        Row: {
          authKey: string
          created: string | null
          firstName: string
          id: number
          lastName: string
          password: string
          phoneNumber: string
        }
        Insert: {
          authKey?: string
          created?: string | null
          firstName: string
          id?: number
          lastName: string
          password: string
          phoneNumber: string
        }
        Update: {
          authKey?: string
          created?: string | null
          firstName?: string
          id?: number
          lastName?: string
          password?: string
          phoneNumber?: string
        }
        Relationships: []
      }
      gameParticipant: {
        Row: {
          created: string
          displayName: string
          gameId: number
          id: number
          lastChange: string
        }
        Insert: {
          created?: string
          displayName: string
          gameId: number
          id?: number
          lastChange?: string
        }
        Update: {
          created?: string
          displayName?: string
          gameId?: number
          id?: number
          lastChange?: string
        }
        Relationships: [
          {
            foreignKeyName: "gameParticipants_gameId_fkey"
            columns: ["gameId"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      gameParticipantDetails: {
        Row: {
          authKey: string
          created: string
          id: number
          lastChange: string
          participantId: number | null
          phoneNumber: string
        }
        Insert: {
          authKey?: string
          created?: string
          id?: number
          lastChange?: string
          participantId?: number | null
          phoneNumber: string
        }
        Update: {
          authKey?: string
          created?: string
          id?: number
          lastChange?: string
          participantId?: number | null
          phoneNumber?: string
        }
        Relationships: [
          {
            foreignKeyName: "gameParticipantDetails_participantId_fkey"
            columns: ["participantId"]
            isOneToOne: false
            referencedRelation: "gameParticipant"
            referencedColumns: ["id"]
          },
        ]
      }
      gameQuestion: {
        Row: {
          completed: string | null
          description: string | null
          gameId: number
          header: string
          id: number
          initialSecondsToAnswer: number | null
          questionOrder: number
          realtimePointsNow: number
          started: string | null
          type: string
        }
        Insert: {
          completed?: string | null
          description?: string | null
          gameId: number
          header: string
          id?: number
          initialSecondsToAnswer?: number | null
          questionOrder: number
          realtimePointsNow?: number
          started?: string | null
          type: string
        }
        Update: {
          completed?: string | null
          description?: string | null
          gameId?: number
          header?: string
          id?: number
          initialSecondsToAnswer?: number | null
          questionOrder?: number
          realtimePointsNow?: number
          started?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gameQuestions_gameId_fkey"
            columns: ["gameId"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      gameQuestionParticipantAnswers: {
        Row: {
          answer: string
          created: string | null
          gameId: number
          id: number
          participantId: number
          pointsOnCorrect: number
          questionId: number
        }
        Insert: {
          answer: string
          created?: string | null
          gameId: number
          id?: number
          participantId: number
          pointsOnCorrect: number
          questionId: number
        }
        Update: {
          answer?: string
          created?: string | null
          gameId?: number
          id?: number
          participantId?: number
          pointsOnCorrect?: number
          questionId?: number
        }
        Relationships: [
          {
            foreignKeyName: "gameQuestionParticipantAnswers_gameId_fkey"
            columns: ["gameId"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gameQuestionParticipantAnswers_participantId_fkey"
            columns: ["participantId"]
            isOneToOne: false
            referencedRelation: "gameParticipant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gameQuestionParticipantAnswers_questionId_fkey"
            columns: ["questionId"]
            isOneToOne: false
            referencedRelation: "gameQuestion"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          completed: string | null
          created: string
          description: string
          displayName: string
          id: number
          lastChange: string | null
          started: string | null
        }
        Insert: {
          completed?: string | null
          created?: string
          description: string
          displayName: string
          id?: number
          lastChange?: string | null
          started?: string | null
        }
        Update: {
          completed?: string | null
          created?: string
          description?: string
          displayName?: string
          id?: number
          lastChange?: string | null
          started?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_question_order: {
        Args: {
          gameid_param: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
