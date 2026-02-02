'use client'

import { OpportunityWithRelations, ProductType } from '@/lib/supabase/database.types'
import { MapPin, TrendingUp, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const productTypeConfig: Record<ProductType, { gradient: string; badge: string; icon: string }> = {
  JV_FLIP: { gradient: 'from-emerald-600 to-teal-700', badge: 'JOINT VENTURE FLIP', icon: '🏠' },
  INSTALMENT_SALE_RECOVERY: { gradient: 'from-blue-600 to-indigo-700', badge: 'INSTALMENT SALE', icon: '📋' },
  RECOVERY: { gradient: 'from-purple-600 to-violet-700', badge: 'RECOVERY', icon: '🔄' },
  RENTAL_INCOME: { gradient: 'from-amber-500 to-orange-600', badge: 'RENTAL INCOME', icon: '🏢' },
  DEVELOPMENT: { gradient: 'from-rose-500 to-pink-600', badge: 'DEVELOPMENT', icon: '🏗️' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ZAR', 'R')
}

interface OpportunityCardProps {
  opportunity: OpportunityWithRelations
  isAuthenticated?: boolean
}

export function OpportunityCard({ opportunity, isAuthenticated = false }: OpportunityCardProps) {
  const config = productTypeConfig[opportunity.product_type]
  const exposurePct = opportunity.exposure_to_market_value_pct ?? 
    (opportunity.market_value ? (opportunity.investment_amount / opportunity.market_value) * 100 : null)

  const terms = opportunity.return_rows.length > 0 
    ? [...new Set(opportunity.return_rows.map(r => r.term_value))].sort((a, b) => a - b)
    : []
  
  const getReturnForTerm = (term: number) => {
    const row = opportunity.return_rows.find(r => 
      r.term_value === term && ['net_return', 'total_return', 'roi', 'return'].includes(r.row_key.toLowerCase())
    )
    return row?.pct
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
      <div className={`bg-gradient-to-r ${config.gradient} px-5 py-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{[opportunity.suburb_or_area, opportunity.province].filter(Boolean).join(', ') || 'South Africa'}</span>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">
              {opportunity.title}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white tracking-wide">
              {config.badge}
            </span>
            {opportunity.deal_code && (
              <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded text-xs text-white/90 font-mono">
                {opportunity.deal_code}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Investment Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(opportunity.investment_amount)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Market Value</p>
            <p className="text-lg font-bold text-gray-900">
              {opportunity.market_value ? formatCurrency(opportunity.market_value) : '—'}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium mb-1">Exposure to MV</p>
            <p className="text-lg font-bold text-emerald-600">
              {exposurePct ? `${exposurePct.toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>

        {terms.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projected Returns</span>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3">
                {terms.slice(0, 3).map(term => {
                  const returnPct = getReturnForTerm(term)
                  return (
                    <div key={term} className="text-center">
                      <p className="text-gray-400 text-xs mb-1">{term} Months</p>
                      <p className={`text-2xl font-bold ${
                        returnPct && returnPct >= 15 ? 'text-emerald-400' : 
                        returnPct && returnPct >= 10 ? 'text-amber-400' : 'text-white'
                      }`}>
                        {returnPct ? `${returnPct.toFixed(2)}%` : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <Link
          href={`/investment-opportunities/${opportunity.id}`}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${config.gradient} text-white py-3 px-4 rounded-xl hover:opacity-90 transition-all font-semibold group-hover:gap-3`}
        >
          <Building2 className="w-4 h-4" />
          View Investment
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
    </div>
  )
}