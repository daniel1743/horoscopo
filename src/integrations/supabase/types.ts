export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          actor_role: string | null;
          created_at: string;
          id: string;
          ip_hash: string | null;
          metadata: Json;
          request_id: string | null;
          resource_id: string | null;
          resource_type: string | null;
          status: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          request_id?: string | null;
          resource_id?: string | null;
          resource_type?: string | null;
          status?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          request_id?: string | null;
          resource_id?: string | null;
          resource_type?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          created_at: string;
          id: string;
          module: string;
          status: string;
          summary: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          module?: string;
          status?: string;
          summary?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          module?: string;
          status?: string;
          summary?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_feedback: {
        Row: {
          created_at: string;
          id: string;
          message_id: string | null;
          module: string | null;
          rating: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message_id?: string | null;
          module?: string | null;
          rating: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_id?: string | null;
          module?: string | null;
          rating?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_feedback_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "ai_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_memories: {
        Row: {
          active: boolean;
          category: string;
          consent_status: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          memory_key: string;
          memory_value: Json;
          source_conversation_id: string | null;
          summary: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          category: string;
          consent_status?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          memory_key: string;
          memory_value: Json;
          source_conversation_id?: string | null;
          summary: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          category?: string;
          consent_status?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          memory_key?: string;
          memory_value?: Json;
          source_conversation_id?: string | null;
          summary?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_memories_source_conversation_id_fkey";
            columns: ["source_conversation_id"];
            isOneToOne: false;
            referencedRelation: "ai_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          model_alias: string | null;
          role: string;
          safety_metadata: Json;
          sources: Json;
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          model_alias?: string | null;
          role: string;
          safety_metadata?: Json;
          sources?: Json;
          user_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          model_alias?: string | null;
          role?: string;
          safety_metadata?: Json;
          sources?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "ai_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_usage_daily: {
        Row: {
          anonymous_key_hash: string | null;
          estimated_cost_micros: number;
          id: string;
          input_tokens: number;
          output_tokens: number;
          requests: number;
          updated_at: string;
          usage_date: string;
          user_id: string | null;
        };
        Insert: {
          anonymous_key_hash?: string | null;
          estimated_cost_micros?: number;
          id?: string;
          input_tokens?: number;
          output_tokens?: number;
          requests?: number;
          updated_at?: string;
          usage_date?: string;
          user_id?: string | null;
        };
        Update: {
          anonymous_key_hash?: string | null;
          estimated_cost_micros?: number;
          id?: string;
          input_tokens?: number;
          output_tokens?: number;
          requests?: number;
          updated_at?: string;
          usage_date?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_user_preferences: {
        Row: {
          citations_expanded: boolean;
          created_at: string;
          memory_enabled: boolean;
          response_length: string;
          tone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          citations_expanded?: boolean;
          created_at?: string;
          memory_enabled?: boolean;
          response_length?: string;
          tone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          citations_expanded?: boolean;
          created_at?: string;
          memory_enabled?: boolean;
          response_length?: string;
          tone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      compatibility_profiles: {
        Row: {
          author_id: string | null;
          challenges: Json;
          communication_tips: Json;
          contexts: Json;
          created_at: string;
          dimensions: Json;
          disclaimer_key: string;
          dynamic_label: string | null;
          id: string;
          is_demo: boolean;
          misconceptions: Json;
          pair_key: string;
          published_at: string | null;
          reflection_questions: Json;
          relationship_dynamic: string;
          seo_description: string | null;
          seo_title: string | null;
          sign_a: string;
          sign_b: string;
          status: string;
          strengths: Json;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          challenges?: Json;
          communication_tips?: Json;
          contexts?: Json;
          created_at?: string;
          dimensions?: Json;
          disclaimer_key?: string;
          dynamic_label?: string | null;
          id?: string;
          is_demo?: boolean;
          misconceptions?: Json;
          pair_key: string;
          published_at?: string | null;
          reflection_questions?: Json;
          relationship_dynamic: string;
          seo_description?: string | null;
          seo_title?: string | null;
          sign_a: string;
          sign_b: string;
          status?: string;
          strengths?: Json;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          challenges?: Json;
          communication_tips?: Json;
          contexts?: Json;
          created_at?: string;
          dimensions?: Json;
          disclaimer_key?: string;
          dynamic_label?: string | null;
          id?: string;
          is_demo?: boolean;
          misconceptions?: Json;
          pair_key?: string;
          published_at?: string | null;
          reflection_questions?: Json;
          relationship_dynamic?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          sign_a?: string;
          sign_b?: string;
          status?: string;
          strengths?: Json;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_profiles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "editorial_authors";
            referencedColumns: ["id"];
          },
        ];
      };
      content_revisions: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          note: string | null;
          resource_id: string;
          resource_type: string;
          snapshot: Json;
          version: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note?: string | null;
          resource_id: string;
          resource_type: string;
          snapshot: Json;
          version: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note?: string | null;
          resource_id?: string;
          resource_type?: string;
          snapshot?: Json;
          version?: number;
        };
        Relationships: [];
      };
      content_workflow: {
        Row: {
          assignee_id: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          resource_id: string;
          resource_type: string;
          updated_at: string;
          updated_by: string | null;
          workflow_state: string;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          resource_id: string;
          resource_type: string;
          updated_at?: string;
          updated_by?: string | null;
          workflow_state?: string;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          resource_id?: string;
          resource_type?: string;
          updated_at?: string;
          updated_by?: string | null;
          workflow_state?: string;
        };
        Relationships: [];
      };
      editorial_articles: {
        Row: {
          author_id: string;
          canonical_override: string | null;
          category_id: string;
          content: Json;
          created_at: string;
          disclaimer_key: string | null;
          excerpt: string;
          featured: boolean;
          home_featured: boolean;
          id: string;
          image_alt: string | null;
          image_url: string | null;
          is_demo: boolean;
          published_at: string | null;
          reading_time: number | null;
          related_article_ids: string[];
          review_date: string | null;
          reviewed_by: string | null;
          seo: Json;
          slug: string;
          sources: Json;
          status: Database["public"]["Enums"]["editorial_status"];
          subtitle: string | null;
          tags: string[];
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          author_id: string;
          canonical_override?: string | null;
          category_id: string;
          content?: Json;
          created_at?: string;
          disclaimer_key?: string | null;
          excerpt: string;
          featured?: boolean;
          home_featured?: boolean;
          id?: string;
          image_alt?: string | null;
          image_url?: string | null;
          is_demo?: boolean;
          published_at?: string | null;
          reading_time?: number | null;
          related_article_ids?: string[];
          review_date?: string | null;
          reviewed_by?: string | null;
          seo?: Json;
          slug: string;
          sources?: Json;
          status?: Database["public"]["Enums"]["editorial_status"];
          subtitle?: string | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          author_id?: string;
          canonical_override?: string | null;
          category_id?: string;
          content?: Json;
          created_at?: string;
          disclaimer_key?: string | null;
          excerpt?: string;
          featured?: boolean;
          home_featured?: boolean;
          id?: string;
          image_alt?: string | null;
          image_url?: string | null;
          is_demo?: boolean;
          published_at?: string | null;
          reading_time?: number | null;
          related_article_ids?: string[];
          review_date?: string | null;
          reviewed_by?: string | null;
          seo?: Json;
          slug?: string;
          sources?: Json;
          status?: Database["public"]["Enums"]["editorial_status"];
          subtitle?: string | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "editorial_articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "editorial_authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "editorial_articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "editorial_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      editorial_authors: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: string;
          name: string;
          role_label: string | null;
          slug: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          role_label?: string | null;
          slug: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          role_label?: string | null;
          slug?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      editorial_categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          key: string;
          label: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          key: string;
          label: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          key?: string;
          label?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      horoscopes: {
        Row: {
          created_at: string;
          date_for: string;
          energy: number;
          focus: string;
          id: string;
          is_demo: boolean;
          love: string | null;
          lucky_color: string | null;
          lucky_number: number | null;
          mood: string;
          period: Database["public"]["Enums"]["horoscope_period"];
          published_at: string | null;
          sign_slug: string;
          summary: string;
          updated_at: string;
          wellbeing: string | null;
          work: string | null;
        };
        Insert: {
          created_at?: string;
          date_for: string;
          energy?: number;
          focus: string;
          id?: string;
          is_demo?: boolean;
          love?: string | null;
          lucky_color?: string | null;
          lucky_number?: number | null;
          mood: string;
          period: Database["public"]["Enums"]["horoscope_period"];
          published_at?: string | null;
          sign_slug: string;
          summary: string;
          updated_at?: string;
          wellbeing?: string | null;
          work?: string | null;
        };
        Update: {
          created_at?: string;
          date_for?: string;
          energy?: number;
          focus?: string;
          id?: string;
          is_demo?: boolean;
          love?: string | null;
          lucky_color?: string | null;
          lucky_number?: number | null;
          mood?: string;
          period?: Database["public"]["Enums"]["horoscope_period"];
          published_at?: string | null;
          sign_slug?: string;
          summary?: string;
          updated_at?: string;
          wellbeing?: string | null;
          work?: string | null;
        };
        Relationships: [];
      };
      moon_calculation_cache: {
        Row: {
          cache_key: string;
          calculated_at: string;
          calculation_type: string;
          engine_version: string;
          expires_at: string;
          id: string;
          period_end: string;
          period_start: string;
          result: Json;
          timezone: string;
        };
        Insert: {
          cache_key: string;
          calculated_at?: string;
          calculation_type: string;
          engine_version: string;
          expires_at: string;
          id?: string;
          period_end: string;
          period_start: string;
          result: Json;
          timezone: string;
        };
        Update: {
          cache_key?: string;
          calculated_at?: string;
          calculation_type?: string;
          engine_version?: string;
          expires_at?: string;
          id?: string;
          period_end?: string;
          period_start?: string;
          result?: Json;
          timezone?: string;
        };
        Relationships: [];
      };
      moon_phase_content: {
        Row: {
          created_at: string;
          disclaimer_key: string;
          id: string;
          image_key: string;
          is_demo: boolean;
          meaning: string;
          misconceptions: Json;
          phase_key: string;
          practical_suggestions: Json;
          published_at: string | null;
          reflection_questions: Json;
          seo_description: string | null;
          seo_title: string | null;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          disclaimer_key?: string;
          id?: string;
          image_key: string;
          is_demo?: boolean;
          meaning: string;
          misconceptions?: Json;
          phase_key: string;
          practical_suggestions?: Json;
          published_at?: string | null;
          reflection_questions?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          disclaimer_key?: string;
          id?: string;
          image_key?: string;
          is_demo?: boolean;
          meaning?: string;
          misconceptions?: Json;
          phase_key?: string;
          practical_suggestions?: Json;
          published_at?: string | null;
          reflection_questions?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_post_likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      community_comment_reports: {
        Row: {
          comment_id: string;
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reporter_id: string;
          status: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reporter_id: string;
          status?: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string;
          status?: string;
        };
        Relationships: [];
      };
      community_post_comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          post_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          post_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      community_post_reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          post_id: string;
          reason: string;
          reporter_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          post_id: string;
          reason: string;
          reporter_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          post_id?: string;
          reason?: string;
          reporter_id?: string;
          status?: string;
        };
        Relationships: [];
      };
      community_post_reposts: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      community_profile_follows: {
        Row: {
          created_at: string;
          followed_id: string;
          follower_id: string;
        };
        Insert: {
          created_at?: string;
          followed_id: string;
          follower_id: string;
        };
        Update: {
          created_at?: string;
          followed_id?: string;
          follower_id?: string;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          post_type: string;
          source_ref: string | null;
          source_title: string | null;
          source_url: string | null;
          status: string;
          title: string | null;
          updated_at: string;
          user_id: string;
          visibility: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          post_type: string;
          source_ref?: string | null;
          source_title?: string | null;
          source_url?: string | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
          user_id: string;
          visibility?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          post_type?: string;
          source_ref?: string | null;
          source_title?: string | null;
          source_url?: string | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      profile_astrology_birth_data: {
        Row: {
          birth_date: string | null;
          birth_latitude: number | null;
          birth_longitude: number | null;
          birth_place_label: string | null;
          birth_time: string | null;
          birth_timezone: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          birth_date?: string | null;
          birth_latitude?: number | null;
          birth_longitude?: number | null;
          birth_place_label?: string | null;
          birth_time?: string | null;
          birth_timezone?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          birth_date?: string | null;
          birth_latitude?: number | null;
          birth_longitude?: number | null;
          birth_place_label?: string | null;
          birth_time?: string | null;
          birth_timezone?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          aura_style: string;
          avatar_url: string | null;
          bio: string | null;
          birth_date: string | null;
          city: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          preferred_sign: string | null;
          profile_visibility: string;
          show_city: boolean;
          show_preferred_sign: boolean;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          aura_style?: string;
          avatar_url?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          preferred_sign?: string | null;
          profile_visibility?: string;
          show_city?: boolean;
          show_preferred_sign?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          aura_style?: string;
          avatar_url?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          preferred_sign?: string | null;
          profile_visibility?: string;
          show_city?: boolean;
          show_preferred_sign?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      saved_tarot_readings: {
        Row: {
          cards: Json;
          created_at: string;
          id: string;
          interpretation: string | null;
          note: string | null;
          spread_type: string;
          user_id: string;
        };
        Insert: {
          cards?: Json;
          created_at?: string;
          id?: string;
          interpretation?: string | null;
          note?: string | null;
          spread_type: string;
          user_id: string;
        };
        Update: {
          cards?: Json;
          created_at?: string;
          id?: string;
          interpretation?: string | null;
          note?: string | null;
          spread_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      search_documents: {
        Row: {
          excerpt: string | null;
          id: string;
          image_key: string | null;
          indexed_at: string;
          is_public: boolean;
          keywords: Json;
          language: string;
          metadata: Json;
          route_path: string;
          search_vector: unknown;
          searchable_text: string;
          source_id: string;
          source_published_at: string | null;
          source_type: string;
          source_updated_at: string | null;
          title: string;
        };
        Insert: {
          excerpt?: string | null;
          id?: string;
          image_key?: string | null;
          indexed_at?: string;
          is_public?: boolean;
          keywords?: Json;
          language?: string;
          metadata?: Json;
          route_path: string;
          search_vector?: unknown;
          searchable_text: string;
          source_id: string;
          source_published_at?: string | null;
          source_type: string;
          source_updated_at?: string | null;
          title: string;
        };
        Update: {
          excerpt?: string | null;
          id?: string;
          image_key?: string | null;
          indexed_at?: string;
          is_public?: boolean;
          keywords?: Json;
          language?: string;
          metadata?: Json;
          route_path?: string;
          search_vector?: unknown;
          searchable_text?: string;
          source_id?: string;
          source_published_at?: string | null;
          source_type?: string;
          source_updated_at?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      tarot_cards: {
        Row: {
          arcana: string;
          card_key: string;
          created_at: string;
          display_order: number;
          id: string;
          image_key: string;
          is_demo: boolean;
          keywords: Json;
          name: string;
          number: number | null;
          published_at: string | null;
          rank: string | null;
          reflection_question: string | null;
          reversed_meaning: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: string;
          suit: string | null;
          summary: string;
          updated_at: string;
          upright_meaning: string;
          yes_no_tendency: string;
        };
        Insert: {
          arcana: string;
          card_key: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          image_key: string;
          is_demo?: boolean;
          keywords?: Json;
          name: string;
          number?: number | null;
          published_at?: string | null;
          rank?: string | null;
          reflection_question?: string | null;
          reversed_meaning?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: string;
          suit?: string | null;
          summary: string;
          updated_at?: string;
          upright_meaning: string;
          yes_no_tendency?: string;
        };
        Update: {
          arcana?: string;
          card_key?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          image_key?: string;
          is_demo?: boolean;
          keywords?: Json;
          name?: string;
          number?: number | null;
          published_at?: string | null;
          rank?: string | null;
          reflection_question?: string | null;
          reversed_meaning?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: string;
          suit?: string | null;
          summary?: string;
          updated_at?: string;
          upright_meaning?: string;
          yes_no_tendency?: string;
        };
        Relationships: [];
      };
      user_activity_history: {
        Row: {
          activity_type: string;
          created_at: string;
          id: string;
          metadata: Json;
          ref_id: string | null;
          ref_type: string | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          ref_id?: string | null;
          ref_type?: string | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          ref_id?: string | null;
          ref_type?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_favorites: {
        Row: {
          created_at: string;
          id: string;
          item_metadata: Json;
          item_ref: string;
          item_title: string | null;
          item_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_metadata?: Json;
          item_ref: string;
          item_title?: string | null;
          item_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_metadata?: Json;
          item_ref?: string;
          item_title?: string | null;
          item_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_privacy_settings: {
        Row: {
          activity_tracking_enabled: boolean;
          ai_personalization_enabled: boolean;
          created_at: string;
          newsletter_opt_in: boolean;
          save_readings_allowed: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activity_tracking_enabled?: boolean;
          ai_personalization_enabled?: boolean;
          created_at?: string;
          newsletter_opt_in?: boolean;
          save_readings_allowed?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activity_tracking_enabled?: boolean;
          ai_personalization_enabled?: boolean;
          created_at?: string;
          newsletter_opt_in?: boolean;
          save_readings_allowed?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          granted_by: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_by?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_public_profile: {
        Args: { p_username: string };
        Returns: {
          aura_style: string;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          display_name: string | null;
          preferred_sign: string | null;
          username: string;
        }[];
      };
      list_public_community_posts: {
        Args: { p_limit?: number };
        Returns: {
          author_aura_style: string;
          author_avatar_url: string | null;
          author_display_name: string | null;
          author_username: string;
          body: string;
          created_at: string;
          id: string;
          liked_by_viewer: boolean;
          likes_count: number;
          post_type: string;
          reposted_by_viewer: boolean;
          reposts_count: number;
          source_ref: string | null;
          source_title: string | null;
          source_url: string | null;
          title: string | null;
        }[];
      };
      list_public_community_reposts: {
        Args: { p_limit?: number };
        Returns: {
          author_aura_style: string;
          author_avatar_url: string | null;
          author_display_name: string | null;
          author_username: string;
          body: string;
          created_at: string;
          id: string;
          liked_by_viewer: boolean;
          likes_count: number;
          post_type: string;
          reposted_by_viewer: boolean;
          reposts_count: number;
          reposter_display_name: string | null;
          reposter_username: string;
          source_ref: string | null;
          source_title: string | null;
          source_url: string | null;
          title: string | null;
        }[];
      };
      list_public_profile_posts: {
        Args: { p_limit?: number; p_username: string };
        Returns: {
          author_aura_style: string;
          author_avatar_url: string | null;
          author_display_name: string | null;
          author_username: string;
          body: string;
          created_at: string;
          id: string;
          liked_by_viewer: boolean;
          likes_count: number;
          post_type: string;
          reposted_by_viewer: boolean;
          reposts_count: number;
          source_ref: string | null;
          source_title: string | null;
          source_url: string | null;
          title: string | null;
        }[];
      };
      list_public_profile_reposts: {
        Args: { p_limit?: number; p_username: string };
        Returns: {
          author_aura_style: string;
          author_avatar_url: string | null;
          author_display_name: string | null;
          author_username: string;
          body: string;
          created_at: string;
          id: string;
          liked_by_viewer: boolean;
          likes_count: number;
          post_type: string;
          reposted_by_viewer: boolean;
          reposts_count: number;
          reposter_display_name: string | null;
          reposter_username: string;
          source_ref: string | null;
          source_title: string | null;
          source_url: string | null;
          title: string | null;
        }[];
      };
      toggle_public_profile_follow: {
        Args: { p_follow: boolean; p_username: string };
        Returns: boolean;
      };
      get_public_profile_follow_stats: {
        Args: { p_username: string };
        Returns: {
          followed_by_viewer: boolean;
          followers_count: number;
          following_count: number;
        }[];
      };
      list_public_community_comments: {
        Args: { p_limit?: number; p_post_id: string };
        Returns: {
          author_aura_style: string;
          author_avatar_url: string | null;
          author_display_name: string | null;
          author_username: string;
          body: string;
          created_at: string;
          id: string;
          owned_by_viewer: boolean;
          post_id: string;
        }[];
      };
      list_open_community_comment_reports: {
        Args: { p_limit?: number };
        Returns: {
          author_username: string | null;
          comment_body: string;
          comment_id: string;
          comment_status: string;
          post_id: string;
          post_title: string | null;
          post_type: string;
          report_details: string | null;
          report_id: string;
          report_reason: string;
          report_status: string;
          reported_at: string;
          reporter_id: string;
        }[];
      };
      moderate_community_comment_report: {
        Args: { p_decision: string; p_note?: string | null; p_report_id: string };
        Returns: boolean;
      };
      list_open_community_reports: {
        Args: { p_limit?: number };
        Returns: {
          author_username: string | null;
          post_body: string;
          post_id: string;
          post_status: string;
          post_title: string | null;
          post_type: string;
          report_details: string | null;
          report_id: string;
          report_reason: string;
          report_status: string;
          reported_at: string;
          reporter_id: string;
        }[];
      };
      moderate_community_report: {
        Args: { p_decision: string; p_note?: string | null; p_report_id: string };
        Returns: boolean;
      };
      admin_product_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: {
          metric_key: string;
          metric_value: number;
        }[];
      };
      current_user_has_role: { Args: { _roles: string[] }; Returns: boolean };
      has_admin_role: {
        Args: { _roles: string[]; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      immutable_unaccent: { Args: { "": string }; Returns: string };
      search_site: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_query: string;
          p_source_types?: string[];
        };
        Returns: {
          excerpt: string;
          image_key: string;
          match_type: string;
          metadata: Json;
          rank: number;
          route_path: string;
          source_id: string;
          source_published_at: string;
          source_type: string;
          title: string;
        }[];
      };
      search_suggest: {
        Args: { p_limit?: number; p_query: string };
        Returns: {
          image_key: string;
          match_type: string;
          metadata: Json;
          route_path: string;
          source_id: string;
          source_type: string;
          title: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      unaccent: { Args: { "": string }; Returns: string };
      zodiac_sign_position: { Args: { sign: string }; Returns: number };
    };
    Enums: {
      app_role: "admin" | "editor" | "super_admin" | "reviewer" | "media_manager";
      editorial_status: "draft" | "published" | "archived";
      horoscope_period: "daily" | "weekly" | "monthly";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "super_admin", "reviewer", "media_manager"],
      editorial_status: ["draft", "published", "archived"],
      horoscope_period: ["daily", "weekly", "monthly"],
    },
  },
} as const;
