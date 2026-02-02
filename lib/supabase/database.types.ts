export type ProductType = 'JV_FLIP' | 'INSTALMENT_SALE_RECOVERY' | 'RECOVERY' | 'RENTAL_INCOME' | 'DEVELOPMENT' | 'FLIP_BREATHER' | 'FLIP_INSTALMENT' | 'FLIP_JV' | 'RECOVERY_LEASEBACK' | 'RECOVERY_INSTALMENT' | 'RECOVERY_BOND' | 'ASSIST_TO_OWN'
export type OpportunityStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD'
export type TermType = 'MONTHS' | 'YEAR'
export type FileType = 'FULL_REPORT' | 'VALUATION' | 'TPN' | 'LIGHTSTONE' | 'COC' | 'OTHER'

export interface Opportunity {
  id: string
  title: string
  suburb_or_area: string | null
  province: string | null
  product_type: ProductType
  deal_code: string | null
  status: OpportunityStatus
  hero_image_url: string | null
  investment_amount: number
  market_value: number | null
  exposure_to_market_value_pct: number | null
  projected_net_annualized_return: number | null
  projected_net_profit: number | null

  // V3 Financials
  net_rental_income: number | null
  capital_growth: number | null
  gross_return: number | null
  external_fees: number | null
  contract_duration_months: number | null

  units_total: number | null
  units_available: number | null
  highlight_badge_text: string | null
  description: string | null
  address: string | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  erf_size: number | null
  floor_size: number | null
  created_at: string
  updated_at: string
}

export interface OpportunityReturnRow {
  id: string
  opportunity_id: string
  row_key: string
  label: string
  term_type: TermType
  term_value: number
  amount: number | null
  pct: number | null
  sort_order: number
  created_at: string
}

export interface OpportunityFile {
  id: string
  opportunity_id: string
  file_type: FileType
  file_name: string
  storage_path: string
  requires_auth: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  is_admin: boolean
  is_verified: boolean
  tier: 'REGISTERED' | 'ACCREDITED' | 'PREVE'
  lead_score: number
  lead_priority: 'HOT' | 'WARM' | 'COLD'
  onboarding_answers: any // JSONB
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  message: string | null
  interest: string | null
  ghl_contact_id: string | null
  status: string
  created_at: string
}

export interface OpportunityWithRelations extends Opportunity {
  return_rows: OpportunityReturnRow[]
  files: OpportunityFile[]
}

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: Opportunity
        Insert: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      opportunity_return_rows: {
        Row: OpportunityReturnRow
        Insert: Omit<OpportunityReturnRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<OpportunityReturnRow, 'id' | 'created_at'>>
        Relationships: []
      }
      opportunity_files: {
        Row: OpportunityFile
        Insert: Omit<OpportunityFile, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<OpportunityFile, 'id' | 'created_at'>>
        Relationships: []
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'status'> & { id?: string; created_at?: string; status?: string }
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string
          status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id: string
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      product_type: ProductType
      opportunity_status: OpportunityStatus
      term_type: TermType
      file_type: FileType
      user_tier: 'REGISTERED' | 'ACCREDITED' | 'PREVE'
      lead_priority: 'HOT' | 'WARM' | 'COLD'
      reservation_status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
    }
    CompositeTypes: Record<string, never>
  }
}