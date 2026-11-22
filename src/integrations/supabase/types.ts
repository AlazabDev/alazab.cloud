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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          document_id: string
          id: string
          project_id: string
          request_note: string | null
          requested_by: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
          version_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          document_id: string
          id?: string
          project_id: string
          request_note?: string | null
          requested_by?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          version_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          document_id?: string
          id?: string
          project_id?: string
          request_note?: string | null
          requested_by?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          document_id: string | null
          id: number
          project_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          document_id?: string | null
          id?: never
          project_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          document_id?: string | null
          id?: never
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          account_id: string | null
          created_at: string
          display_name: string | null
          id: string
          notes: string | null
          phone: string
          updated_at: string
          user_id: string
          whatsapp_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notes?: string | null
          phone: string
          updated_at?: string
          user_id: string
          whatsapp_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
          whatsapp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          account_id: string | null
          contact_id: string
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          contact_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      daftra_invoices: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          currency: string
          doc_number: string
          due_date: string | null
          final_total: number | null
          id: string
          issue_date: string | null
          items_json: Json
          kind: string
          paid_amount: number | null
          payment_status: string | null
          raw_data: Json
          status: string | null
          subtotal: number | null
          synced_at: string
          tax_total: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          currency?: string
          doc_number: string
          due_date?: string | null
          final_total?: number | null
          id: string
          issue_date?: string | null
          items_json?: Json
          kind?: string
          paid_amount?: number | null
          payment_status?: string | null
          raw_data?: Json
          status?: string | null
          subtotal?: number | null
          synced_at?: string
          tax_total?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          currency?: string
          doc_number?: string
          due_date?: string | null
          final_total?: number | null
          id?: string
          issue_date?: string | null
          items_json?: Json
          kind?: string
          paid_amount?: number | null
          payment_status?: string | null
          raw_data?: Json
          status?: string | null
          subtotal?: number | null
          synced_at?: string
          tax_total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      daftra_sync_logs: {
        Row: {
          created_at: string
          error: string | null
          failed: number
          id: string
          processed: number
          source: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          failed?: number
          id?: string
          processed?: number
          source: string
        }
        Update: {
          created_at?: string
          error?: string | null
          failed?: number
          id?: string
          processed?: number
          source?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          checksum: string | null
          created_at: string
          document_id: string
          file_name: string
          id: string
          mime_type: string | null
          notes: string | null
          project_id: string
          revision_label: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          document_id: string
          file_name: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          project_id: string
          revision_label?: string | null
          size_bytes?: number
          storage_path: string
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          checksum?: string | null
          created_at?: string
          document_id?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          project_id?: string
          revision_label?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archived_at: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          discipline: string
          doc_number: string | null
          doc_type: string
          folder_id: string | null
          id: string
          issuing_party: string | null
          project_id: string
          status: Database["public"]["Enums"]["document_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          discipline?: string
          doc_number?: string | null
          doc_type?: string
          folder_id?: string | null
          id?: string
          issuing_party?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["document_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          discipline?: string
          doc_number?: string | null
          doc_type?: string
          folder_id?: string | null
          id?: string
          issuing_party?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          account_id: string | null
          contact_id: string | null
          created_at: string
          file_name: string | null
          id: string
          media_type: string | null
          message_id: string | null
          mime_type: string | null
          size_bytes: number
          status: string
          storage_key: string | null
          storage_url: string | null
          user_id: string
          wa_media_id: string | null
        }
        Insert: {
          account_id?: string | null
          contact_id?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string | null
          message_id?: string | null
          mime_type?: string | null
          size_bytes?: number
          status?: string
          storage_key?: string | null
          storage_url?: string | null
          user_id: string
          wa_media_id?: string | null
        }
        Update: {
          account_id?: string | null
          contact_id?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string | null
          message_id?: string | null
          mime_type?: string | null
          size_bytes?: number
          status?: string
          storage_key?: string | null
          storage_url?: string | null
          user_id?: string
          wa_media_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          account_id: string | null
          category: string
          components: Json
          created_at: string
          id: string
          language: string
          meta_template_id: string | null
          name: string
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          category?: string
          components?: Json
          created_at?: string
          id?: string
          language?: string
          meta_template_id?: string | null
          name: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          category?: string
          components?: Json
          created_at?: string
          id?: string
          language?: string
          meta_template_id?: string | null
          name?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          account_id: string | null
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          media_type: string | null
          media_url: string | null
          sent_by: string | null
          status: string
          user_id: string
          wa_message_id: string | null
        }
        Insert: {
          account_id?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sent_by?: string | null
          status?: string
          user_id: string
          wa_message_id?: string | null
        }
        Update: {
          account_id?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sent_by?: string | null
          status?: string
          user_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_services: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          description_en: string
          icon: string
          id: string
          name: string
          name_en: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          description_en?: string
          icon?: string
          id?: string
          name: string
          name_en?: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          description_en?: string
          icon?: string
          id?: string
          name?: string
          name_en?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          member_role: Database["public"]["Enums"]["project_member_role"]
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_role?: Database["public"]["Enums"]["project_member_role"]
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_role?: Database["public"]["Enums"]["project_member_role"]
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      share_links: {
        Row: {
          allow_download: boolean
          created_at: string
          created_by: string | null
          document_id: string
          expires_at: string
          id: string
          last_viewed_at: string | null
          note: string | null
          project_id: string
          recipient: string | null
          revoked_at: string | null
          token: string
          version_id: string | null
          view_count: number
        }
        Insert: {
          allow_download?: boolean
          created_at?: string
          created_by?: string | null
          document_id: string
          expires_at: string
          id?: string
          last_viewed_at?: string | null
          note?: string | null
          project_id: string
          recipient?: string | null
          revoked_at?: string | null
          token?: string
          version_id?: string | null
          view_count?: number
        }
        Update: {
          allow_download?: boolean
          created_at?: string
          created_by?: string | null
          document_id?: string
          expires_at?: string
          id?: string
          last_viewed_at?: string | null
          note?: string | null
          project_id?: string
          recipient?: string | null
          revoked_at?: string | null
          token?: string
          version_id?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
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
      whatsapp_account_secrets: {
        Row: {
          access_token: string
          account_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          access_token: string
          account_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_account_secrets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_accounts: {
        Row: {
          created_at: string
          display_name: string | null
          display_phone: string | null
          id: string
          is_active: boolean
          phone_number_id: string
          updated_at: string
          user_id: string
          waba_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          display_phone?: string | null
          id?: string
          is_active?: boolean
          phone_number_id: string
          updated_at?: string
          user_id: string
          waba_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          display_phone?: string | null
          id?: string
          is_active?: boolean
          phone_number_id?: string
          updated_at?: string
          user_id?: string
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_document: {
        Args: { _document_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_document: {
        Args: { _document_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_unread: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      project_role: {
        Args: { _project_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["project_member_role"]
      }
      try_uuid: { Args: { _value: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff" | "client"
      approval_status: "pending" | "approved" | "rejected" | "changes_requested"
      document_status:
        | "draft"
        | "in_review"
        | "approved"
        | "rejected"
        | "superseded"
      project_member_role: "manager" | "editor" | "viewer" | "client"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "client"],
      approval_status: ["pending", "approved", "rejected", "changes_requested"],
      document_status: [
        "draft",
        "in_review",
        "approved",
        "rejected",
        "superseded",
      ],
      project_member_role: ["manager", "editor", "viewer", "client"],
    },
  },
} as const
