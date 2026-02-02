'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OpportunityWithRelations } from '@/lib/supabase/database.types'
import { ReturnsTable } from '@/components/opportunities/ReturnsTable'
import { AuthModal } from '@/components/auth/AuthModal'
import { 
  ArrowLeft, MapPin, Building2, Home, Bath, Car, Ruler, FileText, 
  Lock, Download, Loader2 
} from 'lucide-react'
import Link from 'next/link'

const productTypeLabels: Record<string, string> = {
  JV_FLIP: 'JV Flip',
  INSTALMENT_SALE_RECOVERY: 'Instalment Sale Recovery',
  RECOVERY: 'Recovery',
  RENTAL_INCOME: 'Rental Income',
  DEVELOPMENT: 'Development',
}

const fileTypeLabels: Record<string, string> = {
  FULL_REPORT: 'Full Report',
  VALUATION: 'Valuation',
  TPN: 'TPN Report',
  LIGHTSTONE: 'Lightstone Report',
  COC: 'Certificate of Compliance',
  OTHER: 'Document',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ZAR', 'R')
}

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [opportunity, setOpportunity] = useState<OpportunityWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchOpportunity()
    checkAuth()
  }, [id])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)

    supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session)
    })
  }

  const getMockOpportunity = (oppId: string): OpportunityWithRelations | null => {
    const mockData: Record<string, OpportunityWithRelations> = {
      '1': {
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
        description: 'A prime investment opportunity in the heart of Mbombela. This property offers excellent value with strong projected returns.',
        address: null,
        property_type: 'Residential',
        bedrooms: 3,
        bathrooms: 2,
        parking: 2,
        erf_size: null,
        floor_size: 180,
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
          { id: '2', opportunity_id: '1', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 9, amount: null, pct: 18.75, sort_order: 1, created_at: '' },
          { id: '3', opportunity_id: '1', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 12, amount: null, pct: 25.0, sort_order: 2, created_at: '' },
        ],
        files: [],
      },
      '2': {
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
        description: 'Premium coastal property in the sought-after Jakkalsfontein area. Exceptional exposure to market value ratio.',
        address: null,
        property_type: 'Residential',
        bedrooms: 4,
        bathrooms: 3,
        parking: 2,
        erf_size: null,
        floor_size: 250,
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
          { id: '5', opportunity_id: '2', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 9, amount: null, pct: 22.5, sort_order: 1, created_at: '' },
          { id: '6', opportunity_id: '2', row_key: 'net_return', label: 'Net Return', term_type: 'MONTHS', term_value: 12, amount: null, pct: 30.0, sort_order: 2, created_at: '' },
        ],
        files: [],
      },
    }
    return mockData[oppId] || null
  }

  const fetchOpportunity = async () => {
    setLoading(true)
    const { data: opp, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single() as { data: any | null, error: any }

    if (error || !opp) {
      // Fallback to mock data for demo
      const mockOpp = getMockOpportunity(id)
      if (mockOpp) {
        setOpportunity(mockOpp)
      }
      setLoading(false)
      return
    }

    const { data: returnRows } = await supabase
      .from('opportunity_return_rows')
      .select('*')
      .eq('opportunity_id', opp.id)
      .order('sort_order', { ascending: true }) as { data: any[] | null }

    const { data: files } = await supabase
      .from('opportunity_files')
      .select('*')
      .eq('opportunity_id', opp.id) as { data: any[] | null }

    setOpportunity({
      ...opp,
      return_rows: returnRows || [],
      files: files || [],
    })
    setLoading(false)
  }

  const downloadFile = async (storagePath: string, _fileName: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    const { data, error } = await supabase.storage
      .from('opportunity-files')
      .createSignedUrl(storagePath, 60)

    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error)
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-600">Opportunity not found</h2>
        <Link href="/investment-opportunities" className="mt-4 text-emerald-600 hover:underline">
          Back to opportunities
        </Link>
      </div>
    )
  }

  const exposurePct = opportunity.exposure_to_market_value_pct ?? 
    (opportunity.market_value ? (opportunity.investment_amount / opportunity.market_value) * 100 : null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            href="/investment-opportunities" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to opportunities
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {opportunity.suburb_or_area && `${opportunity.suburb_or_area}, `}{opportunity.province}
              </div>
              <h1 className="text-3xl font-bold">{opportunity.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-600 px-3 py-1 rounded-full text-sm">
                {productTypeLabels[opportunity.product_type]}
              </span>
              {opportunity.deal_code && (
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {opportunity.deal_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {opportunity.hero_image_url && (
              <div className="rounded-xl overflow-hidden">
                <img 
                  src={opportunity.hero_image_url} 
                  alt={opportunity.title}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            {opportunity.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-line">{opportunity.description}</p>
              </div>
            )}

            {(opportunity.bedrooms || opportunity.bathrooms || opportunity.parking || opportunity.erf_size || opportunity.floor_size) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {opportunity.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-gray-400" />
                      <span>{opportunity.bedrooms} Beds</span>
                    </div>
                  )}
                  {opportunity.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <span>{opportunity.bathrooms} Baths</span>
                    </div>
                  )}
                  {opportunity.parking && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span>{opportunity.parking} Parking</span>
                    </div>
                  )}
                  {opportunity.floor_size && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-gray-400" />
                      <span>{opportunity.floor_size}m² Floor</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {opportunity.return_rows.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Returns Structure</h2>
                <ReturnsTable rows={opportunity.return_rows} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Investment Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="text-xl font-bold">{formatCurrency(opportunity.investment_amount)}</span>
                </div>
                {opportunity.market_value && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Market Value</span>
                    <span className="text-xl font-bold">{formatCurrency(opportunity.market_value)}</span>
                  </div>
                )}
                {exposurePct && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Exposure to Market</span>
                    <span className="text-xl font-bold text-emerald-600">{exposurePct.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    opportunity.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    opportunity.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {opportunity.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              {opportunity.files.length > 0 ? (
                <div className="space-y-2">
                  {opportunity.files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => downloadFile(file.storage_path, file.file_name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isAuthenticated 
                          ? 'border-gray-200 hover:bg-gray-50 hover:border-emerald-300'
                          : 'border-gray-100 bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{fileTypeLabels[file.file_type]}</p>
                        <p className="text-sm text-gray-500">{file.file_name}</p>
                      </div>
                      {file.requires_auth && !isAuthenticated ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Download className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents available</p>
              )}

              {!isAuthenticated && opportunity.files.some(f => f.requires_auth) && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Login to Access Documents
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}