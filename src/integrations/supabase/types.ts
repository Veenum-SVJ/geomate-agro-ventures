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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      crop_production: {
        Row: {
          activity_type: string
          cost: number | null
          created_at: string
          created_by: string | null
          crop_name: string
          farm_id: string
          id: string
          notes: string | null
          plot_name: string | null
          quantity: number | null
          record_date: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          crop_name: string
          farm_id: string
          id?: string
          notes?: string | null
          plot_name?: string | null
          quantity?: number | null
          record_date?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          crop_name?: string
          farm_id?: string
          id?: string
          notes?: string | null
          plot_name?: string | null
          quantity?: number | null
          record_date?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_production_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_sales: {
        Row: {
          created_at: string
          created_by: string | null
          crop_name: string
          customer_name: string | null
          customer_phone: string | null
          farm_id: string
          id: string
          notes: string | null
          price_per_kg: number
          quantity_kg: number
          sale_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crop_name: string
          customer_name?: string | null
          customer_phone?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          price_per_kg?: number
          quantity_kg?: number
          sale_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crop_name?: string
          customer_name?: string | null
          customer_phone?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          price_per_kg?: number
          quantity_kg?: number
          sale_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_sales_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          customer_type: string | null
          email: string | null
          farm_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: string | null
          email?: string | null
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          customer_type?: string | null
          email?: string | null
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          created_at: string
          farm_type: string[] | null
          id: string
          location: string | null
          name: string
          size_hectares: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_type?: string[] | null
          id?: string
          location?: string | null
          name: string
          size_hectares?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_type?: string[] | null
          id?: string
          location?: string | null
          name?: string
          size_hectares?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      feedmill_ingredients: {
        Row: {
          cost_per_kg: number
          created_at: string
          created_by: string | null
          farm_id: string
          id: string
          ingredient_name: string
          notes: string | null
          quantity_kg: number
          record_date: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          cost_per_kg?: number
          created_at?: string
          created_by?: string | null
          farm_id: string
          id?: string
          ingredient_name: string
          notes?: string | null
          quantity_kg?: number
          record_date?: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          cost_per_kg?: number
          created_at?: string
          created_by?: string | null
          farm_id?: string
          id?: string
          ingredient_name?: string
          notes?: string | null
          quantity_kg?: number
          record_date?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedmill_ingredients_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedmill_power: {
        Row: {
          cost: number
          created_at: string
          created_by: string | null
          farm_id: string
          id: string
          notes: string | null
          power_type: string
          quantity: number | null
          record_date: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          created_by?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          power_type: string
          quantity?: number | null
          record_date?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          created_by?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          power_type?: string
          quantity?: number | null
          record_date?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedmill_power_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedmill_production: {
        Row: {
          bags_produced: number | null
          created_at: string
          created_by: string | null
          farm_id: string
          feed_type: string
          id: string
          notes: string | null
          production_cost: number | null
          quantity_produced_kg: number
          record_date: string
          updated_at: string
        }
        Insert: {
          bags_produced?: number | null
          created_at?: string
          created_by?: string | null
          farm_id: string
          feed_type: string
          id?: string
          notes?: string | null
          production_cost?: number | null
          quantity_produced_kg?: number
          record_date?: string
          updated_at?: string
        }
        Update: {
          bags_produced?: number | null
          created_at?: string
          created_by?: string | null
          farm_id?: string
          feed_type?: string
          id?: string
          notes?: string | null
          production_cost?: number | null
          quantity_produced_kg?: number
          record_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedmill_production_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      fishery_production: {
        Row: {
          created_at: string
          created_by: string | null
          farm_id: string
          feed_cost: number | null
          feed_given_kg: number
          fish_species: string | null
          id: string
          notes: string | null
          oxygen_level: number | null
          pond_name: string
          record_date: string
          stock_count: number
          updated_at: string
          water_ph: number | null
          water_temperature: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          farm_id: string
          feed_cost?: number | null
          feed_given_kg?: number
          fish_species?: string | null
          id?: string
          notes?: string | null
          oxygen_level?: number | null
          pond_name: string
          record_date?: string
          stock_count?: number
          updated_at?: string
          water_ph?: number | null
          water_temperature?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          farm_id?: string
          feed_cost?: number | null
          feed_given_kg?: number
          fish_species?: string | null
          id?: string
          notes?: string | null
          oxygen_level?: number | null
          pond_name?: string
          record_date?: string
          stock_count?: number
          updated_at?: string
          water_ph?: number | null
          water_temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fishery_production_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      fishery_sales: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          farm_id: string
          fish_species: string
          id: string
          notes: string | null
          price_per_kg: number
          quantity_kg: number
          sale_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          farm_id: string
          fish_species: string
          id?: string
          notes?: string | null
          price_per_kg?: number
          quantity_kg?: number
          sale_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          farm_id?: string
          fish_species?: string
          id?: string
          notes?: string | null
          price_per_kg?: number
          quantity_kg?: number
          sale_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fishery_sales_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number | null
          created_at: string
          created_by: string | null
          farm_id: string
          id: string
          item_name: string
          last_restocked: string | null
          min_stock_level: number | null
          notes: string | null
          quantity: number
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          farm_id: string
          id?: string
          item_name: string
          last_restocked?: string | null
          min_stock_level?: number | null
          notes?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          farm_id?: string
          id?: string
          item_name?: string
          last_restocked?: string | null
          min_stock_level?: number | null
          notes?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      poultry_production: {
        Row: {
          created_at: string
          created_by: string | null
          egg_count: number
          farm_id: string
          health_notes: string | null
          hen_count: number
          id: string
          mortality: number
          record_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          egg_count?: number
          farm_id: string
          health_notes?: string | null
          hen_count?: number
          id?: string
          mortality?: number
          record_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          egg_count?: number
          farm_id?: string
          health_notes?: string | null
          hen_count?: number
          id?: string
          mortality?: number
          record_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poultry_production_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      poultry_resources: {
        Row: {
          created_at: string
          created_by: string | null
          farm_id: string
          feed_consumed_kg: number
          feed_cost: number | null
          id: string
          medication_cost: number | null
          medications: string | null
          record_date: string
          updated_at: string
          water_consumed_liters: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          farm_id: string
          feed_consumed_kg?: number
          feed_cost?: number | null
          id?: string
          medication_cost?: number | null
          medications?: string | null
          record_date?: string
          updated_at?: string
          water_consumed_liters?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          farm_id?: string
          feed_consumed_kg?: number
          feed_cost?: number | null
          id?: string
          medication_cost?: number | null
          medications?: string | null
          record_date?: string
          updated_at?: string
          water_consumed_liters?: number
        }
        Relationships: [
          {
            foreignKeyName: "poultry_resources_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      poultry_sales: {
        Row: {
          bird_price_each: number
          birds_sold: number
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          egg_price_per_crate: number
          eggs_sold: number
          farm_id: string
          id: string
          notes: string | null
          sale_date: string
          updated_at: string
        }
        Insert: {
          bird_price_each?: number
          birds_sold?: number
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          egg_price_per_crate?: number
          eggs_sold?: number
          farm_id: string
          id?: string
          notes?: string | null
          sale_date?: string
          updated_at?: string
        }
        Update: {
          bird_price_each?: number
          birds_sold?: number
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          egg_price_per_crate?: number
          eggs_sold?: number
          farm_id?: string
          id?: string
          notes?: string | null
          sale_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poultry_sales_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          farm_id: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          farm_id?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          farm_id?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          farm_id: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          farm_id: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          farm_id?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          farm_id: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          farm_id: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          farm_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          content: string | null
          id: string
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      website_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          stock_status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          stock_status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          stock_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          farm_id: string
          full_name: string
          hire_date: string | null
          id: string
          notes: string | null
          phone: string | null
          role: string
          salary: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          farm_id: string
          full_name: string
          hire_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          farm_id?: string
          full_name?: string
          hire_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { _token: string }; Returns: Json }
      create_farm_with_role: {
        Args: {
          _farm_type?: string[]
          _location?: string
          _name: string
          _size_hectares?: number
        }
        Returns: string
      }
      farm_has_no_roles: { Args: { _farm_id: string }; Returns: boolean }
      get_user_farm_id: { Args: { _user_id: string }; Returns: string }
      get_user_farm_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_farm_admin: {
        Args: { _farm_id: string; _user_id: string }
        Returns: boolean
      }
      user_belongs_to_farm: {
        Args: { _farm_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "worker"
      subscription_tier: "free" | "basic" | "premium"
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
  public: {
    Enums: {
      app_role: ["admin", "manager", "worker"],
      subscription_tier: ["free", "basic", "premium"],
    },
  },
} as const
