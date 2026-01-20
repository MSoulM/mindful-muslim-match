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
    PostgrestVersion: "13.0.5"
  }
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          last_webauthn_challenge_data: Json | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          approved_at: string | null
          authorization_code: string | null
          authorization_id: string
          client_id: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string
          expires_at: string
          id: string
          nonce: string | null
          redirect_uri: string
          resource: string | null
          response_type: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state: string | null
          status: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id: string
          client_id: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id: string
          nonce?: string | null
          redirect_uri: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id?: string
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string | null
          redirect_uri?: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope?: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_client_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Insert: {
          code_verifier?: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider_type?: string
        }
        Relationships: []
      }
      oauth_clients: {
        Row: {
          client_name: string | null
          client_secret_hash: string | null
          client_type: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri: string | null
          created_at: string
          deleted_at: string | null
          grant_types: string
          id: string
          logo_uri: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types: string
          id: string
          logo_uri?: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types?: string
          id?: string
          logo_uri?: string | null
          redirect_uris?: string
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at?: string
        }
        Relationships: []
      }
      oauth_consents: {
        Row: {
          client_id: string
          granted_at: string
          id: string
          revoked_at: string | null
          scopes: string
          user_id: string
        }
        Insert: {
          client_id: string
          granted_at?: string
          id: string
          revoked_at?: string | null
          scopes: string
          user_id: string
        }
        Update: {
          client_id?: string
          granted_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown
          not_after: string | null
          oauth_client_id: string | null
          refresh_token_counter: number | null
          refresh_token_hmac_key: string | null
          refreshed_at: string | null
          scopes: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: { Args: never; Returns: string }
      jwt: { Args: never; Returns: Json }
      role: { Args: never; Returns: string }
      uid: { Args: never; Returns: string }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired"
      oauth_client_type: "public" | "confidential"
      oauth_registration_type: "dynamic" | "manual"
      oauth_response_type: "code"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      abuse_flags: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          details: Json | null
          flag_type: string
          id: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          details?: Json | null
          flag_type: string
          id?: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          details?: Json | null
          flag_type?: string
          id?: string
        }
        Relationships: []
      }
      batch_processing_queue: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          id: string
          job_type: string
          last_error: string | null
          max_attempts: number
          payload: Json
          priority: number
          scheduled_for: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          job_type: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          job_type?: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          scheduled_for?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      batch_run_history: {
        Row: {
          api_cost_cents: number
          completed_at: string | null
          completed_jobs: number
          duration_seconds: number | null
          error_log: Json
          failed_jobs: number
          id: string
          metadata: Json | null
          run_type: string
          started_at: string
          status: string
          tokens_used: number
          total_jobs: number
        }
        Insert: {
          api_cost_cents?: number
          completed_at?: string | null
          completed_jobs?: number
          duration_seconds?: number | null
          error_log?: Json
          failed_jobs?: number
          id?: string
          metadata?: Json | null
          run_type: string
          started_at?: string
          status?: string
          tokens_used?: number
          total_jobs?: number
        }
        Update: {
          api_cost_cents?: number
          completed_at?: string | null
          completed_jobs?: number
          duration_seconds?: number | null
          error_log?: Json
          failed_jobs?: number
          id?: string
          metadata?: Json | null
          run_type?: string
          started_at?: string
          status?: string
          tokens_used?: number
          total_jobs?: number
        }
        Relationships: []
      }
      behavioral_tracking: {
        Row: {
          avg_message_length: number | null
          avg_response_time_hours: number | null
          avg_swipe_time_seconds: number | null
          created_at: string
          emoji_usage_rate: number | null
          insights_approval_rate: number | null
          match_acceptance_rate: number | null
          median_response_time_hours: number | null
          messages_per_match: number | null
          peak_activity_hour: number | null
          period_end: string
          period_start: string
          profile_completion_speed_days: number | null
          profile_views_per_day: number | null
          response_time_stddev: number | null
          tracking_id: string
          tracking_period_end: string
          tracking_period_start: string
          uniqueness_score: number | null
          updated_at: string
          user_id: string
          voice_message_ratio: number | null
          weekend_activity_ratio: number | null
          z_scores: Json | null
        }
        Insert: {
          avg_message_length?: number | null
          avg_response_time_hours?: number | null
          avg_swipe_time_seconds?: number | null
          created_at?: string
          emoji_usage_rate?: number | null
          insights_approval_rate?: number | null
          match_acceptance_rate?: number | null
          median_response_time_hours?: number | null
          messages_per_match?: number | null
          peak_activity_hour?: number | null
          period_end: string
          period_start: string
          profile_completion_speed_days?: number | null
          profile_views_per_day?: number | null
          response_time_stddev?: number | null
          tracking_id?: string
          tracking_period_end: string
          tracking_period_start: string
          uniqueness_score?: number | null
          updated_at?: string
          user_id: string
          voice_message_ratio?: number | null
          weekend_activity_ratio?: number | null
          z_scores?: Json | null
        }
        Update: {
          avg_message_length?: number | null
          avg_response_time_hours?: number | null
          avg_swipe_time_seconds?: number | null
          created_at?: string
          emoji_usage_rate?: number | null
          insights_approval_rate?: number | null
          match_acceptance_rate?: number | null
          median_response_time_hours?: number | null
          messages_per_match?: number | null
          peak_activity_hour?: number | null
          period_end?: string
          period_start?: string
          profile_completion_speed_days?: number | null
          profile_views_per_day?: number | null
          response_time_stddev?: number | null
          tracking_id?: string
          tracking_period_end?: string
          tracking_period_start?: string
          uniqueness_score?: number | null
          updated_at?: string
          user_id?: string
          voice_message_ratio?: number | null
          weekend_activity_ratio?: number | null
          z_scores?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_clusters: {
        Row: {
          city_key: Database["public"]["Enums"]["city_key_type"]
          city_name: string
          created_at: string | null
          default_locale: string
          formality_level: number
          is_enabled: boolean
          region: string
          timezone: string
          tone_style: string | null
          updated_at: string | null
        }
        Insert: {
          city_key: Database["public"]["Enums"]["city_key_type"]
          city_name: string
          created_at?: string | null
          default_locale?: string
          formality_level?: number
          is_enabled?: boolean
          region: string
          timezone: string
          tone_style?: string | null
          updated_at?: string | null
        }
        Update: {
          city_key?: Database["public"]["Enums"]["city_key_type"]
          city_name?: string
          created_at?: string | null
          default_locale?: string
          formality_level?: number
          is_enabled?: boolean
          region?: string
          timezone?: string
          tone_style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      city_prompts: {
        Row: {
          city_key: Database["public"]["Enums"]["city_key_type"]
          created_at: string | null
          greeting_templates: Json | null
          id: string
          is_active: boolean
          personality_key:
            | Database["public"]["Enums"]["personality_key_type"]
            | null
          prompt_overlay: string
          tone_adjustments: Json | null
          updated_at: string | null
          version: number
        }
        Insert: {
          city_key: Database["public"]["Enums"]["city_key_type"]
          created_at?: string | null
          greeting_templates?: Json | null
          id?: string
          is_active?: boolean
          personality_key?:
            | Database["public"]["Enums"]["personality_key_type"]
            | null
          prompt_overlay: string
          tone_adjustments?: Json | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          city_key?: Database["public"]["Enums"]["city_key_type"]
          created_at?: string | null
          greeting_templates?: Json | null
          id?: string
          is_active?: boolean
          personality_key?:
            | Database["public"]["Enums"]["personality_key_type"]
            | null
          prompt_overlay?: string
          tone_adjustments?: Json | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "city_prompts_city_key_fkey"
            columns: ["city_key"]
            isOneToOne: false
            referencedRelation: "city_clusters"
            referencedColumns: ["city_key"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_id: string | null
          last_message_preview: string | null
          last_message_sender_clerk_id: string | null
          last_message_sent_at: string | null
          last_message_type: string | null
          updated_at: string
          user1_clerk_id: string
          user1_unread_count: number
          user2_clerk_id: string
          user2_unread_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_id?: string | null
          last_message_preview?: string | null
          last_message_sender_clerk_id?: string | null
          last_message_sent_at?: string | null
          last_message_type?: string | null
          updated_at?: string
          user1_clerk_id: string
          user1_unread_count?: number
          user2_clerk_id: string
          user2_unread_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_message_id?: string | null
          last_message_preview?: string | null
          last_message_sender_clerk_id?: string | null
          last_message_sent_at?: string | null
          last_message_type?: string | null
          updated_at?: string
          user1_clerk_id?: string
          user1_unread_count?: number
          user2_clerk_id?: string
          user2_unread_count?: number
        }
        Relationships: []
      }
      cost_alerts: {
        Row: {
          alert_name: string
          created_at: string | null
          email_recipient: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          slack_webhook_url: string | null
          threshold_percent: number
          updated_at: string | null
        }
        Insert: {
          alert_name: string
          created_at?: string | null
          email_recipient?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          slack_webhook_url?: string | null
          threshold_percent: number
          updated_at?: string | null
        }
        Update: {
          alert_name?: string
          created_at?: string | null
          email_recipient?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          slack_webhook_url?: string | null
          threshold_percent?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cultural_backgrounds: {
        Row: {
          background_type: string
          clerk_user_id: string
          created_at: string | null
          id: string
          is_primary: boolean
        }
        Insert: {
          background_type: string
          clerk_user_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean
        }
        Update: {
          background_type?: string
          clerk_user_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean
        }
        Relationships: []
      }
      cultural_profiles: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          id: string
          languages: string[] | null
          location: string | null
          primary_background: string
          strength: string
          strength_value: number
          updated_at: string | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          id?: string
          languages?: string[] | null
          location?: string | null
          primary_background: string
          strength: string
          strength_value: number
          updated_at?: string | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          id?: string
          languages?: string[] | null
          location?: string | null
          primary_background?: string
          strength?: string
          strength_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cultural_variants: {
        Row: {
          ab_test_variant: string | null
          ab_test_weight: number
          created_at: string | null
          cultural_region: Database["public"]["Enums"]["cultural_region_type"]
          expression_library: Json | null
          id: string
          is_active: boolean
          local_references: Json | null
          personality_key: Database["public"]["Enums"]["personality_key_type"]
          prompt_overlay: string
          updated_at: string | null
        }
        Insert: {
          ab_test_variant?: string | null
          ab_test_weight?: number
          created_at?: string | null
          cultural_region: Database["public"]["Enums"]["cultural_region_type"]
          expression_library?: Json | null
          id?: string
          is_active?: boolean
          local_references?: Json | null
          personality_key: Database["public"]["Enums"]["personality_key_type"]
          prompt_overlay: string
          updated_at?: string | null
        }
        Update: {
          ab_test_variant?: string | null
          ab_test_weight?: number
          created_at?: string | null
          cultural_region?: Database["public"]["Enums"]["cultural_region_type"]
          expression_library?: Json | null
          id?: string
          is_active?: boolean
          local_references?: Json | null
          personality_key?: Database["public"]["Enums"]["personality_key_type"]
          prompt_overlay?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dna_answers: {
        Row: {
          answer: Json
          clerk_user_id: string
          created_at: string | null
          id: string
          question_id: string
          updated_at: string | null
        }
        Insert: {
          answer: Json
          clerk_user_id: string
          created_at?: string | null
          id?: string
          question_id: string
          updated_at?: string | null
        }
        Update: {
          answer?: Json
          clerk_user_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "dna_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_questionnaires: {
        Row: {
          category: string
          created_at: string | null
          id: string
          max_selections: number | null
          options: Json
          question: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          max_selections?: number | null
          options: Json
          question: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          max_selections?: number | null
          options?: Json
          question?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gamification_progress: {
        Row: {
          badges: Json
          bonus_10_insights: boolean
          bonus_3_day_streak: boolean
          bonus_5_insights: boolean
          bonus_7_day_streak: boolean
          bonus_70_percent_profile: boolean
          clerk_user_id: string
          created_at: string
          id: string
          insights_approved: number
          insights_rejected: number
          insights_reviewed: number
          last_review_date: string | null
          longest_streak: number
          milestone_100: boolean
          milestone_25: boolean
          milestone_50: boolean
          milestone_75: boolean
          streak_days: number
          total_points: number
          updated_at: string
        }
        Insert: {
          badges?: Json
          bonus_10_insights?: boolean
          bonus_3_day_streak?: boolean
          bonus_5_insights?: boolean
          bonus_7_day_streak?: boolean
          bonus_70_percent_profile?: boolean
          clerk_user_id: string
          created_at?: string
          id?: string
          insights_approved?: number
          insights_rejected?: number
          insights_reviewed?: number
          last_review_date?: string | null
          longest_streak?: number
          milestone_100?: boolean
          milestone_25?: boolean
          milestone_50?: boolean
          milestone_75?: boolean
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          badges?: Json
          bonus_10_insights?: boolean
          bonus_3_day_streak?: boolean
          bonus_5_insights?: boolean
          bonus_7_day_streak?: boolean
          bonus_70_percent_profile?: boolean
          clerk_user_id?: string
          created_at?: string
          id?: string
          insights_approved?: number
          insights_rejected?: number
          insights_reviewed?: number
          last_review_date?: string | null
          longest_streak?: number
          milestone_100?: boolean
          milestone_25?: boolean
          milestone_50?: boolean
          milestone_75?: boolean
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      governance_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean
          priority: number
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          action: string
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      islamic_preferences: {
        Row: {
          clerk_user_id: string
          community_service_level: string | null
          created_at: string | null
          family_planning_desires: string | null
          halal_importance: number | null
          halal_preference: string | null
          id: string
          islamic_education_level: string | null
          islamic_studies_focus: string[] | null
          living_arrangement_preferences: string | null
          madhab: string
          marriage_timeline_expectations: string | null
          masjid_attendance: string | null
          muslim_since: string
          notes: string | null
          partner_age_max: number | null
          partner_age_min: number | null
          partner_height_preference: string | null
          partner_hijab_required: boolean | null
          partner_prayer_importance: number | null
          partner_sect_preference: string[] | null
          polygamy_acceptance: string | null
          prayer_frequency: string
          quran_reading_frequency: string | null
          relocate_for_spouse: boolean | null
          revert_year: number | null
          sect: string
          spiritual_growth_style: string | null
          updated_at: string | null
          wali_involvement: string | null
        }
        Insert: {
          clerk_user_id: string
          community_service_level?: string | null
          created_at?: string | null
          family_planning_desires?: string | null
          halal_importance?: number | null
          halal_preference?: string | null
          id?: string
          islamic_education_level?: string | null
          islamic_studies_focus?: string[] | null
          living_arrangement_preferences?: string | null
          madhab: string
          marriage_timeline_expectations?: string | null
          masjid_attendance?: string | null
          muslim_since: string
          notes?: string | null
          partner_age_max?: number | null
          partner_age_min?: number | null
          partner_height_preference?: string | null
          partner_hijab_required?: boolean | null
          partner_prayer_importance?: number | null
          partner_sect_preference?: string[] | null
          polygamy_acceptance?: string | null
          prayer_frequency: string
          quran_reading_frequency?: string | null
          relocate_for_spouse?: boolean | null
          revert_year?: number | null
          sect: string
          spiritual_growth_style?: string | null
          updated_at?: string | null
          wali_involvement?: string | null
        }
        Update: {
          clerk_user_id?: string
          community_service_level?: string | null
          created_at?: string | null
          family_planning_desires?: string | null
          halal_importance?: number | null
          halal_preference?: string | null
          id?: string
          islamic_education_level?: string | null
          islamic_studies_focus?: string[] | null
          living_arrangement_preferences?: string | null
          madhab?: string
          marriage_timeline_expectations?: string | null
          masjid_attendance?: string | null
          muslim_since?: string
          notes?: string | null
          partner_age_max?: number | null
          partner_age_min?: number | null
          partner_height_preference?: string | null
          partner_hijab_required?: boolean | null
          partner_prayer_importance?: number | null
          partner_sect_preference?: string[] | null
          polygamy_acceptance?: string | null
          prayer_frequency?: string
          quran_reading_frequency?: string | null
          relocate_for_spouse?: boolean | null
          revert_year?: number | null
          sect?: string
          spiritual_growth_style?: string | null
          updated_at?: string | null
          wali_involvement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "islamic_preferences_clerk_user_id_fkey"
            columns: ["clerk_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["clerk_user_id"]
          },
        ]
      }
      local_references: {
        Row: {
          address: string | null
          city_key: Database["public"]["Enums"]["city_key_type"]
          context_keywords: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          name: string
          neighborhood: string | null
          reference_type: Database["public"]["Enums"]["reference_type"]
          updated_at: string | null
          usage_count: number
        }
        Insert: {
          address?: string | null
          city_key: Database["public"]["Enums"]["city_key_type"]
          context_keywords?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          name: string
          neighborhood?: string | null
          reference_type: Database["public"]["Enums"]["reference_type"]
          updated_at?: string | null
          usage_count?: number
        }
        Update: {
          address?: string | null
          city_key?: Database["public"]["Enums"]["city_key_type"]
          context_keywords?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          name?: string
          neighborhood?: string | null
          reference_type?: Database["public"]["Enums"]["reference_type"]
          updated_at?: string | null
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "local_references_city_key_fkey"
            columns: ["city_key"]
            isOneToOne: false
            referencedRelation: "city_clusters"
            referencedColumns: ["city_key"]
          },
        ]
      }
      match_preferences: {
        Row: {
          age_range_max: number
          age_range_min: number
          clerk_user_id: string
          created_at: string | null
          education_preferences: Json
          has_children_preference: string
          id: string
          marital_status_preferences: Json
          max_distance: number
          religiosity_preferences: Json
          updated_at: string | null
        }
        Insert: {
          age_range_max?: number
          age_range_min?: number
          clerk_user_id: string
          created_at?: string | null
          education_preferences?: Json
          has_children_preference?: string
          id?: string
          marital_status_preferences?: Json
          max_distance?: number
          religiosity_preferences?: Json
          updated_at?: string | null
        }
        Update: {
          age_range_max?: number
          age_range_min?: number
          clerk_user_id?: string
          created_at?: string | null
          education_preferences?: Json
          has_children_preference?: string
          id?: string
          marital_status_preferences?: Json
          max_distance?: number
          religiosity_preferences?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          attachment_type: string
          created_at: string
          display_order: number
          duration_seconds: number | null
          file_extension: string | null
          file_name: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          message_id: string
          mime_type: string | null
          storage_path: string | null
          thumbnail_url: string | null
          url: string
          waveform: Json | null
          width: number | null
        }
        Insert: {
          attachment_type: string
          created_at?: string
          display_order?: number
          duration_seconds?: number | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          message_id: string
          mime_type?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          url: string
          waveform?: Json | null
          width?: number | null
        }
        Update: {
          attachment_type?: string
          created_at?: string
          display_order?: number
          duration_seconds?: number | null
          file_extension?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          message_id?: string
          mime_type?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          url?: string
          waveform?: Json | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_clerk_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_clerk_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_clerk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean
          message_type: string
          read_at: string | null
          recipient_clerk_id: string
          reply_to_message_id: string | null
          sender_clerk_id: string
          sent_at: string
          status: string
          updated_at: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean
          message_type?: string
          read_at?: string | null
          recipient_clerk_id: string
          reply_to_message_id?: string | null
          sender_clerk_id: string
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean
          message_type?: string
          read_at?: string | null
          recipient_clerk_id?: string
          reply_to_message_id?: string | null
          sender_clerk_id?: string
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mmagent_conversation_memory: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          embedding: string
          id: string
          importance_score: number | null
          message_pair: Json
          topics: string[] | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          embedding: string
          id?: string
          importance_score?: number | null
          message_pair: Json
          topics?: string[] | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          embedding?: string
          id?: string
          importance_score?: number | null
          message_pair?: Json
          topics?: string[] | null
        }
        Relationships: []
      }
      mmagent_messages: {
        Row: {
          clerk_user_id: string
          content: string
          created_at: string | null
          id: string
          is_visible: boolean | null
          model_used: string | null
          personality_used: string | null
          role: string | null
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          clerk_user_id: string
          content: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          model_used?: string | null
          personality_used?: string | null
          role?: string | null
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          clerk_user_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          model_used?: string | null
          personality_used?: string | null
          role?: string | null
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mmagent_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mmagent_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mmagent_prompts: {
        Row: {
          change_notes: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          is_draft: boolean
          personality_key: Database["public"]["Enums"]["personality_key_type"]
          system_prompt: string
          token_count: number | null
          tone_parameters: Json
          updated_at: string | null
          version: number
        }
        Insert: {
          change_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_draft?: boolean
          personality_key: Database["public"]["Enums"]["personality_key_type"]
          system_prompt: string
          token_count?: number | null
          tone_parameters?: Json
          updated_at?: string | null
          version?: number
        }
        Update: {
          change_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_draft?: boolean
          personality_key?: Database["public"]["Enums"]["personality_key_type"]
          system_prompt?: string
          token_count?: number | null
          tone_parameters?: Json
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "mmagent_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mmagent_sessions: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          message_count: number | null
          title: string | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mmagent_token_usage: {
        Row: {
          claude_tokens: number | null
          clerk_user_id: string
          conversations_active: number | null
          date: string
          estimated_cost_pence: number | null
          gpt4o_mini_tokens: number | null
          id: string
          last_reset_at: string | null
          messages_sent: number | null
          tokens_limit: number
          tokens_used: number | null
        }
        Insert: {
          claude_tokens?: number | null
          clerk_user_id: string
          conversations_active?: number | null
          date?: string
          estimated_cost_pence?: number | null
          gpt4o_mini_tokens?: number | null
          id?: string
          last_reset_at?: string | null
          messages_sent?: number | null
          tokens_limit: number
          tokens_used?: number | null
        }
        Update: {
          claude_tokens?: number | null
          clerk_user_id?: string
          conversations_active?: number | null
          date?: string
          estimated_cost_pence?: number | null
          gpt4o_mini_tokens?: number | null
          id?: string
          last_reset_at?: string | null
          messages_sent?: number | null
          tokens_limit?: number
          tokens_used?: number | null
        }
        Relationships: []
      }
      mysoul_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          created_at: string | null
          earned_at: string
          id: string
          notification_sent: boolean | null
          user_id: string
          viewed: boolean | null
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          created_at?: string | null
          earned_at?: string
          id?: string
          notification_sent?: boolean | null
          user_id: string
          viewed?: boolean | null
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          created_at?: string | null
          earned_at?: string
          id?: string
          notification_sent?: boolean | null
          user_id?: string
          viewed?: boolean | null
        }
        Relationships: []
      }
      mysoul_dna_scores: {
        Row: {
          algorithm_version: string | null
          approved_insights_count: number
          behavioral_raw_score: number
          change_delta: number | null
          component_breakdown: Json | null
          content_raw_score: number
          created_at: string
          cultural_raw_score: number
          days_active: number
          id: string
          last_calculated_at: string
          last_significant_change: string | null
          percentile_rank: number | null
          previous_tier: string | null
          profile_depth_raw_score: number
          rare_traits: Json | null
          rarity_tier: string
          score: number
          tier_changed_at: string | null
          trait_rarity_raw_score: number
          unique_behaviors: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          algorithm_version?: string | null
          approved_insights_count?: number
          behavioral_raw_score?: number
          change_delta?: number | null
          component_breakdown?: Json | null
          content_raw_score?: number
          created_at?: string
          cultural_raw_score?: number
          days_active?: number
          id?: string
          last_calculated_at?: string
          last_significant_change?: string | null
          percentile_rank?: number | null
          previous_tier?: string | null
          profile_depth_raw_score?: number
          rare_traits?: Json | null
          rarity_tier?: string
          score?: number
          tier_changed_at?: string | null
          trait_rarity_raw_score?: number
          unique_behaviors?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          algorithm_version?: string | null
          approved_insights_count?: number
          behavioral_raw_score?: number
          change_delta?: number | null
          component_breakdown?: Json | null
          content_raw_score?: number
          created_at?: string
          cultural_raw_score?: number
          days_active?: number
          id?: string
          last_calculated_at?: string
          last_significant_change?: string | null
          percentile_rank?: number | null
          previous_tier?: string | null
          profile_depth_raw_score?: number
          rare_traits?: Json | null
          rarity_tier?: string
          score?: number
          tier_changed_at?: string | null
          trait_rarity_raw_score?: number
          unique_behaviors?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mysoul_score_history: {
        Row: {
          algorithm_version: string | null
          behavioral_raw_score: number | null
          calculated_at: string
          component_breakdown: Json | null
          content_raw_score: number | null
          created_at: string | null
          cultural_raw_score: number | null
          id: string
          percentile_rank: number | null
          profile_depth_raw_score: number | null
          rarity_tier: string
          score: number
          trait_rarity_raw_score: number | null
          user_id: string
        }
        Insert: {
          algorithm_version?: string | null
          behavioral_raw_score?: number | null
          calculated_at?: string
          component_breakdown?: Json | null
          content_raw_score?: number | null
          created_at?: string | null
          cultural_raw_score?: number | null
          id?: string
          percentile_rank?: number | null
          profile_depth_raw_score?: number | null
          rarity_tier: string
          score: number
          trait_rarity_raw_score?: number | null
          user_id: string
        }
        Update: {
          algorithm_version?: string | null
          behavioral_raw_score?: number | null
          calculated_at?: string
          component_breakdown?: Json | null
          content_raw_score?: number | null
          created_at?: string | null
          cultural_raw_score?: number | null
          id?: string
          percentile_rank?: number | null
          profile_depth_raw_score?: number | null
          rarity_tier?: string
          score?: number
          trait_rarity_raw_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          chai_chat_updates: boolean
          clerk_user_id: string
          created_at: string | null
          email_digest: string
          email_enabled: boolean
          id: string
          messages: boolean
          metadata: Json
          new_matches: boolean
          promotions: boolean
          push_enabled: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          respect_prayer_times: boolean
          sms_enabled: boolean
          updated_at: string | null
          weekly_insights: boolean
        }
        Insert: {
          chai_chat_updates?: boolean
          clerk_user_id: string
          created_at?: string | null
          email_digest?: string
          email_enabled?: boolean
          id?: string
          messages?: boolean
          metadata?: Json
          new_matches?: boolean
          promotions?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          respect_prayer_times?: boolean
          sms_enabled?: boolean
          updated_at?: string | null
          weekly_insights?: boolean
        }
        Update: {
          chai_chat_updates?: boolean
          clerk_user_id?: string
          created_at?: string | null
          email_digest?: string
          email_enabled?: boolean
          id?: string
          messages?: boolean
          metadata?: Json
          new_matches?: boolean
          promotions?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          respect_prayer_times?: boolean
          sms_enabled?: boolean
          updated_at?: string | null
          weekly_insights?: boolean
        }
        Relationships: []
      }
      personality_assessments: {
        Row: {
          answers: Json | null
          clerk_user_id: string
          completed_at: string | null
          created_at: string | null
          cultural_bridge_score: number | null
          current_step: number | null
          id: string
          modern_scholar_score: number | null
          personality_type: string | null
          scores: Json | null
          spiritual_guide_score: number | null
          updated_at: string | null
          wise_aunty_score: number | null
        }
        Insert: {
          answers?: Json | null
          clerk_user_id: string
          completed_at?: string | null
          created_at?: string | null
          cultural_bridge_score?: number | null
          current_step?: number | null
          id?: string
          modern_scholar_score?: number | null
          personality_type?: string | null
          scores?: Json | null
          spiritual_guide_score?: number | null
          updated_at?: string | null
          wise_aunty_score?: number | null
        }
        Update: {
          answers?: Json | null
          clerk_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          cultural_bridge_score?: number | null
          current_step?: number | null
          id?: string
          modern_scholar_score?: number | null
          personality_type?: string | null
          scores?: Json | null
          spiritual_guide_score?: number | null
          updated_at?: string | null
          wise_aunty_score?: number | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          analysis_result: Json | null
          caption: string | null
          categories: string[] | null
          clerk_user_id: string
          comments_count: number | null
          content_hash: string | null
          created_at: string | null
          deleted_at: string | null
          depth_level: number | null
          embedding: string | null
          id: string
          is_approved: boolean | null
          is_visible: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          processed_at: string | null
          processing_status: string | null
          report_count: number | null
          search_vector: unknown
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          analysis_result?: Json | null
          caption?: string | null
          categories?: string[] | null
          clerk_user_id: string
          comments_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          deleted_at?: string | null
          depth_level?: number | null
          embedding?: string | null
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          processed_at?: string | null
          processing_status?: string | null
          report_count?: number | null
          search_vector?: unknown
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          analysis_result?: Json | null
          caption?: string | null
          categories?: string[] | null
          clerk_user_id?: string
          comments_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          deleted_at?: string | null
          depth_level?: number | null
          embedding?: string | null
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          processed_at?: string | null
          processing_status?: string | null
          report_count?: number | null
          search_vector?: unknown
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annual_income_range: string | null
          bio: string | null
          birthdate: string | null
          build: string | null
          children_count: number | null
          clerk_user_id: string
          created_at: string | null
          cultural_traditions: string | null
          deleted_at: string | null
          dietary_preferences: string[] | null
          dna_score: number | null
          dna_traits: Json | null
          education_level: string | null
          email_verified: boolean | null
          ethnicity: string | null
          exercise_frequency: string | null
          family_structure: string | null
          family_values: string | null
          first_name: string | null
          gender: string | null
          gender_preference: string[] | null
          has_children: boolean | null
          height: number | null
          hobbies: string[] | null
          hometown: string | null
          id: string
          industry: string | null
          is_matchable: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_active_at: string | null
          last_name: string | null
          lat: number | null
          lng: number | null
          location: string | null
          marital_status: string | null
          number_of_siblings: number | null
          occupation: string | null
          onboarding_completed: boolean | null
          parents_marital_status: string | null
          pets: boolean | null
          phone_verified: boolean | null
          photos: Json | null
          preferences: Json | null
          preferences_notifications: Json | null
          primary_photo_url: string | null
          profile_visibility: string | null
          religion: Json | null
          report_count: number | null
          search_vector: unknown
          settings_privacy: Json | null
          smoking: string | null
          status_text: string | null
          subscription_tier: string | null
          tags: string[] | null
          updated_at: string | null
          wants_children: boolean | null
        }
        Insert: {
          annual_income_range?: string | null
          bio?: string | null
          birthdate?: string | null
          build?: string | null
          children_count?: number | null
          clerk_user_id: string
          created_at?: string | null
          cultural_traditions?: string | null
          deleted_at?: string | null
          dietary_preferences?: string[] | null
          dna_score?: number | null
          dna_traits?: Json | null
          education_level?: string | null
          email_verified?: boolean | null
          ethnicity?: string | null
          exercise_frequency?: string | null
          family_structure?: string | null
          family_values?: string | null
          first_name?: string | null
          gender?: string | null
          gender_preference?: string[] | null
          has_children?: boolean | null
          height?: number | null
          hobbies?: string[] | null
          hometown?: string | null
          id?: string
          industry?: string | null
          is_matchable?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          marital_status?: string | null
          number_of_siblings?: number | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          parents_marital_status?: string | null
          pets?: boolean | null
          phone_verified?: boolean | null
          photos?: Json | null
          preferences?: Json | null
          preferences_notifications?: Json | null
          primary_photo_url?: string | null
          profile_visibility?: string | null
          religion?: Json | null
          report_count?: number | null
          search_vector?: unknown
          settings_privacy?: Json | null
          smoking?: string | null
          status_text?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wants_children?: boolean | null
        }
        Update: {
          annual_income_range?: string | null
          bio?: string | null
          birthdate?: string | null
          build?: string | null
          children_count?: number | null
          clerk_user_id?: string
          created_at?: string | null
          cultural_traditions?: string | null
          deleted_at?: string | null
          dietary_preferences?: string[] | null
          dna_score?: number | null
          dna_traits?: Json | null
          education_level?: string | null
          email_verified?: boolean | null
          ethnicity?: string | null
          exercise_frequency?: string | null
          family_structure?: string | null
          family_values?: string | null
          first_name?: string | null
          gender?: string | null
          gender_preference?: string[] | null
          has_children?: boolean | null
          height?: number | null
          hobbies?: string[] | null
          hometown?: string | null
          id?: string
          industry?: string | null
          is_matchable?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          marital_status?: string | null
          number_of_siblings?: number | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          parents_marital_status?: string | null
          pets?: boolean | null
          phone_verified?: boolean | null
          photos?: Json | null
          preferences?: Json | null
          preferences_notifications?: Json | null
          primary_photo_url?: string | null
          profile_visibility?: string | null
          religion?: Json | null
          report_count?: number | null
          search_vector?: unknown
          settings_privacy?: Json | null
          smoking?: string | null
          status_text?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wants_children?: boolean | null
        }
        Relationships: []
      }
      prompt_test_history: {
        Row: {
          admin_notes: string | null
          admin_rating: number | null
          id: string
          prompt_id: string
          response_time_ms: number | null
          test_input: string
          test_output: string | null
          tested_at: string | null
          tested_by: string | null
          token_usage: number | null
        }
        Insert: {
          admin_notes?: string | null
          admin_rating?: number | null
          id?: string
          prompt_id: string
          response_time_ms?: number | null
          test_input: string
          test_output?: string | null
          tested_at?: string | null
          tested_by?: string | null
          token_usage?: number | null
        }
        Update: {
          admin_notes?: string | null
          admin_rating?: number | null
          id?: string
          prompt_id?: string
          response_time_ms?: number | null
          test_input?: string
          test_output?: string | null
          tested_at?: string | null
          tested_by?: string | null
          token_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "mmagent_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_test_history_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_history: {
        Row: {
          clerk_user_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["streak_event_type"]
          id: string
          metadata: Json | null
          milestone_reached: string | null
          reward_given: string | null
          streak_after: number
          streak_before: number
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["streak_event_type"]
          id?: string
          metadata?: Json | null
          milestone_reached?: string | null
          reward_given?: string | null
          streak_after?: number
          streak_before?: number
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["streak_event_type"]
          id?: string
          metadata?: Json | null
          milestone_reached?: string | null
          reward_given?: string | null
          streak_after?: number
          streak_before?: number
        }
        Relationships: []
      }
      streak_rewards: {
        Row: {
          bonus_credits: number
          clerk_user_id: string
          created_at: string
          current_streak: number
          discount_earned: boolean
          discount_expires_at: string | null
          discount_percentage: number
          grace_expires_at: string | null
          grace_period_used: boolean
          id: string
          last_activity_date: string
          longest_streak: number
          milestones_achieved: Json
          updated_at: string
        }
        Insert: {
          bonus_credits?: number
          clerk_user_id: string
          created_at?: string
          current_streak?: number
          discount_earned?: boolean
          discount_expires_at?: string | null
          discount_percentage?: number
          grace_expires_at?: string | null
          grace_period_used?: boolean
          id?: string
          last_activity_date?: string
          longest_streak?: number
          milestones_achieved?: Json
          updated_at?: string
        }
        Update: {
          bonus_credits?: number
          clerk_user_id?: string
          created_at?: string
          current_streak?: number
          discount_earned?: boolean
          discount_expires_at?: string | null
          discount_percentage?: number
          grace_expires_at?: string | null
          grace_period_used?: boolean
          id?: string
          last_activity_date?: string
          longest_streak?: number
          milestones_achieved?: Json
          updated_at?: string
        }
        Relationships: []
      }
      trait_distribution_stats: {
        Row: {
          created_at: string | null
          frequency: number | null
          idf_score: number | null
          last_updated: string | null
          total_users: number
          trait_category: string
          trait_display_name: string | null
          trait_key: string
          user_count: number
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          idf_score?: number | null
          last_updated?: string | null
          total_users?: number
          trait_category: string
          trait_display_name?: string | null
          trait_key: string
          user_count?: number
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          idf_score?: number | null
          last_updated?: string | null
          total_users?: number
          trait_category?: string
          trait_display_name?: string | null
          trait_key?: string
          user_count?: number
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          last_typed_at: string
          user_clerk_id: string
        }
        Insert: {
          conversation_id: string
          last_typed_at?: string
          user_clerk_id: string
        }
        Update: {
          conversation_id?: string
          last_typed_at?: string
          user_clerk_id?: string
        }
        Relationships: []
      }
      user_city_assignments: {
        Row: {
          assignment_method: Database["public"]["Enums"]["assignment_method_type"]
          city_key: Database["public"]["Enums"]["city_key_type"]
          clerk_user_id: string
          created_at: string | null
          detected_location: Json | null
          id: string
          ip_country: string | null
          is_current: boolean
        }
        Insert: {
          assignment_method: Database["public"]["Enums"]["assignment_method_type"]
          city_key: Database["public"]["Enums"]["city_key_type"]
          clerk_user_id: string
          created_at?: string | null
          detected_location?: Json | null
          id?: string
          ip_country?: string | null
          is_current?: boolean
        }
        Update: {
          assignment_method?: Database["public"]["Enums"]["assignment_method_type"]
          city_key?: Database["public"]["Enums"]["city_key_type"]
          clerk_user_id?: string
          created_at?: string | null
          detected_location?: Json | null
          id?: string
          ip_country?: string | null
          is_current?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_city_assignments_city_key_fkey"
            columns: ["city_key"]
            isOneToOne: false
            referencedRelation: "city_clusters"
            referencedColumns: ["city_key"]
          },
        ]
      }
      user_insights: {
        Row: {
          clerk_user_id: string
          confidence_score: number
          contributes_to_dna: boolean
          created_at: string
          description: string
          dna_weight: number | null
          expires_at: string
          id: string
          insight_category: string
          reviewed_at: string | null
          source_quote: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          confidence_score?: number
          contributes_to_dna?: boolean
          created_at?: string
          description: string
          dna_weight?: number | null
          expires_at?: string
          id?: string
          insight_category: string
          reviewed_at?: string | null
          source_quote?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          confidence_score?: number
          contributes_to_dna?: boolean
          created_at?: string
          description?: string
          dna_weight?: number | null
          expires_at?: string
          id?: string
          insight_category?: string
          reviewed_at?: string | null
          source_quote?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      voice_introductions: {
        Row: {
          created_at: string
          duration_seconds: number
          file_type: string
          id: string
          is_active: boolean
          language: string | null
          personality_markers: Json | null
          processed_at: string | null
          processing_status: string
          storage_path: string
          transcription: string | null
          transcription_confidence: number | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds: number
          file_type: string
          id?: string
          is_active?: boolean
          language?: string | null
          personality_markers?: Json | null
          processed_at?: string | null
          processing_status?: string
          storage_path: string
          transcription?: string | null
          transcription_confidence?: number | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          file_type?: string
          id?: string
          is_active?: boolean
          language?: string | null
          personality_markers?: Json | null
          processed_at?: string | null
          processing_status?: string
          storage_path?: string
          transcription?: string | null
          transcription_confidence?: number | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_matches: {
        Row: {
          actioned_at: string | null
          batch_run_id: string | null
          chaichat_preview: Json | null
          compatibility_factors: Json | null
          created_at: string
          id: string
          match_user_id: string
          rank: number
          score: number
          user_id: string
          viewed_at: string | null
          week_start_date: string
        }
        Insert: {
          actioned_at?: string | null
          batch_run_id?: string | null
          chaichat_preview?: Json | null
          compatibility_factors?: Json | null
          created_at?: string
          id?: string
          match_user_id: string
          rank: number
          score: number
          user_id: string
          viewed_at?: string | null
          week_start_date: string
        }
        Update: {
          actioned_at?: string | null
          batch_run_id?: string | null
          chaichat_preview?: Json | null
          compatibility_factors?: Json | null
          created_at?: string
          id?: string
          match_user_id?: string
          rank?: number
          score?: number
          user_id?: string
          viewed_at?: string | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_matches_batch_run_id_fkey"
            columns: ["batch_run_id"]
            isOneToOne: false
            referencedRelation: "batch_run_history"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_dna_percentile_rank: {
        Args: { user_score: number }
        Returns: number
      }
      cleanup_score_history: { Args: never; Returns: number }
      get_or_create_conversation: {
        Args: { p_user1_clerk_id: string; p_user2_clerk_id: string }
        Returns: string
      }
      get_or_create_token_record: {
        Args: { p_clerk_user_id: string; p_limit: number }
        Returns: {
          claude_tokens: number | null
          clerk_user_id: string
          conversations_active: number | null
          date: string
          estimated_cost_pence: number | null
          gpt4o_mini_tokens: number | null
          id: string
          last_reset_at: string | null
          messages_sent: number | null
          tokens_limit: number
          tokens_used: number | null
        }
        SetofOptions: {
          from: "*"
          to: "mmagent_token_usage"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_profile_completion_status: {
        Args: { user_clerk_id: string }
        Returns: {
          can_be_discovered: boolean
          can_message: boolean
          has_approved_photo: boolean
          has_completed_voice: boolean
        }[]
      }
      has_completed_voice_intro: {
        Args: { user_clerk_id: string }
        Returns: boolean
      }
      match_memories: {
        Args: {
          match_count: number
          match_threshold: number
          p_clerk_user_id: string
          query_embedding: string
        }
        Returns: {
          id: string
          importance_score: number
          message_pair: Json
          similarity: number
          topics: string[]
        }[]
      }
      record_score_history: {
        Args: {
          p_algorithm_version: string
          p_behavioral_raw_score: number
          p_component_breakdown: Json
          p_content_raw_score: number
          p_cultural_raw_score: number
          p_percentile_rank: number
          p_profile_depth_raw_score: number
          p_rarity_tier: string
          p_score: number
          p_trait_rarity_raw_score: number
          p_user_id: string
        }
        Returns: string
      }
      refresh_trait_distribution_stats: { Args: never; Returns: number }
    }
    Enums: {
      assignment_method_type: "auto_detected" | "user_selected" | "fallback"
      city_key_type:
        | "london"
        | "nyc"
        | "houston_chicago"
        | "dubai"
        | "mumbai_dhaka"
      cultural_region_type:
        | "south_asian"
        | "middle_eastern"
        | "southeast_asian"
        | "western_convert"
        | "african"
      personality_key_type:
        | "wise_aunty"
        | "modern_scholar"
        | "spiritual_guide"
        | "cultural_bridge"
      reference_type:
        | "mosque"
        | "restaurant"
        | "event"
        | "organization"
        | "landmark"
      streak_event_type:
        | "activity"
        | "milestone"
        | "reset"
        | "grace_used"
        | "discount_applied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  public: {
    Enums: {
      assignment_method_type: ["auto_detected", "user_selected", "fallback"],
      city_key_type: [
        "london",
        "nyc",
        "houston_chicago",
        "dubai",
        "mumbai_dhaka",
      ],
      cultural_region_type: [
        "south_asian",
        "middle_eastern",
        "southeast_asian",
        "western_convert",
        "african",
      ],
      personality_key_type: [
        "wise_aunty",
        "modern_scholar",
        "spiritual_guide",
        "cultural_bridge",
      ],
      reference_type: [
        "mosque",
        "restaurant",
        "event",
        "organization",
        "landmark",
      ],
      streak_event_type: [
        "activity",
        "milestone",
        "reset",
        "grace_used",
        "discount_applied",
      ],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
