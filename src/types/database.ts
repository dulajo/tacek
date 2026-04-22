export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          is_core: boolean;
          revolut_username: string | null;
          bank_account: string | null;
        };
        Insert: {
          id: string;
          name: string;
          is_core: boolean;
          revolut_username?: string | null;
          bank_account?: string | null;
        };
        Update: {
          name?: string;
          is_core?: boolean;
          revolut_username?: string | null;
          bank_account?: string | null;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
          is_shared: boolean;
          is_favorite: boolean;
        };
        Insert: {
          id: string;
          name: string;
          price: number;
          category: string;
          is_shared: boolean;
          is_favorite: boolean;
        };
        Update: {
          name?: string;
          price?: number;
          category?: string;
          is_shared?: boolean;
          is_favorite?: boolean;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          date: string;
          name: string | null;
          payer_id: string;
          total_amount: number;
          tip: number;
          status: string;
        };
        Insert: {
          id: string;
          date: string;
          name?: string | null;
          payer_id: string;
          total_amount: number;
          tip: number;
          status: string;
        };
        Update: {
          date?: string;
          name?: string | null;
          payer_id?: string;
          total_amount?: number;
          tip?: number;
          status?: string;
        };
        Relationships: [];
      };
      event_members: {
        Row: {
          event_id: string;
          member_id: string;
          paid_self: boolean;
        };
        Insert: {
          event_id: string;
          member_id: string;
          paid_self?: boolean;
        };
        Update: {
          paid_self?: boolean;
        };
        Relationships: [];
      };
      event_preset_items: {
        Row: {
          event_id: string;
          menu_item_id: string;
          quantity: number;
        };
        Insert: {
          event_id: string;
          menu_item_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
        };
        Relationships: [];
      };
      member_consumptions: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          has_paid: boolean;
          total_amount: number;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          has_paid?: boolean;
          total_amount?: number;
        };
        Update: {
          has_paid?: boolean;
          total_amount?: number;
        };
        Relationships: [];
      };
      consumption_items: {
        Row: {
          consumption_id: string;
          menu_item_id: string;
          quantity: number;
        };
        Insert: {
          consumption_id: string;
          menu_item_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
        };
        Relationships: [];
      };
      consumption_shared_items: {
        Row: {
          consumption_id: string;
          menu_item_id: string;
        };
        Insert: {
          consumption_id: string;
          menu_item_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
