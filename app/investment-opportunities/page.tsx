'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OpportunityWithRelations, ProductType, OpportunityStatus } from '@/lib/supabase/database.types'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { OpportunityFilters } from '@/components/opportunities/OpportunityFilters'
import { AuthModal } from '@/components/auth/AuthModal'
import { Building2, Loader2 } from 'lucide-react'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    productType: '' as ProductType | '',
    province: '',
    status: '' as OpportunityStatus | '',
    minInvestment: '',
    maxInvestment: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchOpportunities()
    checkAuth()

    const handleOpenAuth = () => setShowAuthModal(true)
    window.addEventListener('openAuthModal', handleOpenAuth)
    return () => window.removeEventListener('openAuthModal', handleOpenAuth)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)

    supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session)
    })
  }

  const fetchOpportunities = async () => {
    setLoading(true)
    const { data: opps, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false }) as { data: any[] | null, error: any }

    if (error) {
      console.error('Error fetching opportunities:', error?.message || 'Table may not exist - run supabase/schema.sql')
      // Use mock data for demo
      setOpportunities(getMockOpportunities())
      setLoading(false)
      return
    }

    const oppsWithRelations: OpportunityWithRelations[] = await Promise.all(
      (opps || []).map(async (opp: any) => {
        const { data: returnRows } = await supabase
          .from('opportunity_return_rows')
          .select('*')
          .eq('opportunity_id', opp.id)
          .order('sort_order', { ascending: true }) as { data: any[] | null }

        const { data: files } = await supabase
          .from('opportunity_files')
          .select('*')
          .eq('opportunity_id', opp.id) as { data: any[] | null }

        return {
          ...opp,
          return_rows: returnRows || [],
          files: files || [],
        }
      })
    )

    setOpportunities(oppsWithRelations.length > 0 ? oppsWithRelations : getMockOpportunities())
    setLoading(false)
  }

  const getMockOpportunities = (): OpportunityWithRelations[] => [
    {
      id: '1',
      title: 'MBOMBELA, MPUMALANGA',
      suburb_or_area: 'Mbombela',
      province: 'Mpumalanga',
      product_type: 'JV_FLIP',
      deal_code: 'OSP40/MBO/ZA',
      status: 'AVAILABLE',
      hero_image_url: null,
      investment_amount: 760000,
      market_value: 1500000,
      exposure_to_market_value_pct: 50.67,
      units_total: null,
      units_available: null,
      highlight_badge_text: null,
      description: null,
      address: null,
      property_type: 'Residential',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      erf_size: null,
      floor_size: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      projected_net_annualized_return: 13.5,
      projected_net_profit: 60000,
      net_rental_income: 12000,
      capital_growth: 48000,
      gross_return: 60000,
      external_fees: 500,
      contract_duration_months: 12,
      return_rows: [
        { id: '1', opportunity_id: '1', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 6, amount: null, pct: 12.5, sort_order: 0, created_at: '' },
        { id: '2', opportunity_id: '1', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 9, amount: null, pct: 18.75, sort_order: 0, created_at: '' },
        { id: '3', opportunity_id: '1', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 12, amount: null, pct: 25.0, sort_order: 0, created_at: '' },
      ],
      files: [],
    },
    {
      id: '2',
      title: 'JAKKALSFONTEIN, WESTERN CAPE',
      suburb_or_area: 'Jakkalsfontein',
      province: 'Western Cape',
      product_type: 'JV_FLIP',
      deal_code: 'HER213/GAL/DAR/ZA',
      status: 'AVAILABLE',
      hero_image_url: null,
      investment_amount: 1250000,
      market_value: 2800000,
      exposure_to_market_value_pct: 44.64,
      units_total: null,
      units_available: null,
      highlight_badge_text: null,
      description: null,
      address: null,
      property_type: 'Residential',
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      erf_size: null,
      floor_size: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      projected_net_annualized_return: 18.2,
      projected_net_profit: 150000,
      net_rental_income: 30000,
      capital_growth: 120000,
      gross_return: 150000,
      external_fees: 1000,
      contract_duration_months: 18,
      return_rows: [
        { id: '4', opportunity_id: '2', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 6, amount: null, pct: 15.0, sort_order: 0, created_at: '' },
        { id: '5', opportunity_id: '2', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 9, amount: null, pct: 22.5, sort_order: 0, created_at: '' },
        { id: '6', opportunity_id: '2', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 12, amount: null, pct: 30.0, sort_order: 0, created_at: '' },
      ],
      files: [],
    },
  ]

  const provinces = useMemo(() => {
    const provs = opportunities
      .map(o => o.province)
      .filter((p): p is string => !!p)
    return [...new Set(provs)].sort()
  }, [opportunities])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesSearch =
          opp.title.toLowerCase().includes(search) ||
          opp.suburb_or_area?.toLowerCase().includes(search) ||
          opp.province?.toLowerCase().includes(search) ||
          opp.deal_code?.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      if (filters.productType && opp.product_type !== filters.productType) return false
      if (filters.province && opp.province !== filters.province) return false
      if (filters.status && opp.status !== filters.status) return false

      if (filters.minInvestment) {
        const min = parseFloat(filters.minInvestment)
        if (opp.investment_amount < min) return false
      }

      if (filters.maxInvestment) {
        const max = parseFloat(filters.maxInvestment)
        if (opp.investment_amount > max) return false
      }

      return true
    })
  }, [opportunities, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-10 h-10 text-emerald-400" />
            <h1 className="text-4xl font-bold">Investment Opportunities</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl">
            Explore our curated selection of real estate investment opportunities with guaranteed returns and low market exposure.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <OpportunityFilters
          filters={filters}
          onFilterChange={setFilters}
          provinces={provinces}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No opportunities found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => fetchOpportunities()}
      />
    </div>
  )
}