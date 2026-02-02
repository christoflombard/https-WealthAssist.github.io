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
  FLIP_BREATHER: { gradient: 'from-teal-500 to-cyan-600', badge: 'FLIP BREATHER', icon: '⏸️' },
  FLIP_INSTALMENT: { gradient: 'from-sky-500 to-blue-600', badge: 'FLIP INSTALMENT', icon: '📊' },
  FLIP_JV: { gradient: 'from-emerald-500 to-green-600', badge: 'FLIP JV', icon: '🤝' },
  RECOVERY_LEASEBACK: { gradient: 'from-violet-500 to-purple-600', badge: 'RECOVERY LEASEBACK', icon: '🔑' },
  RECOVERY_INSTALMENT: { gradient: 'from-indigo-500 to-blue-600', badge: 'RECOVERY INSTALMENT', icon: '📈' },
  RECOVERY_BOND: { gradient: 'from-fuchsia-500 to-pink-600', badge: 'RECOVERY BOND', icon: '🏦' },
  ASSIST_TO_OWN: { gradient: 'from-orange-500 to-amber-600', badge: 'ASSIST TO OWN', icon: '🎯' },
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
        {/* Financial Metrics Grid - World-Class Alignment */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Investment Amount */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl p-4 flex flex-col items-center justify-between h-[88px] border border-gray-100">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center h-[24px] flex items-center">
              Investment Amount
            </p>
            <p className="text-base font-bold text-gray-900 tracking-tight">
              {formatCurrency(opportunity.investment_amount)}
            </p>
          </div>
          {/* Market Value */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl p-4 flex flex-col items-center justify-between h-[88px] border border-gray-100">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center h-[24px] flex items-center">
              Market Value
            </p>
            <p className="text-base font-bold text-gray-900 tracking-tight">
              {opportunity.market_value ? formatCurrency(opportunity.market_value) : '—'}
            </p>
          </div>
          {/* Exposure to MV - Highlighted */}
          <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/50 rounded-xl p-4 flex flex-col items-center justify-between h-[88px] border-2 border-emerald-300 shadow-sm shadow-emerald-100">
            <p className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold text-center h-[24px] flex items-center">
              Exposure to MV
            </p>
            <p className="text-lg font-bold text-emerald-600 tracking-tight">
              {exposurePct ? `${exposurePct.toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>

        {terms.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Projected Returns</span>
            </div>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-2">
                {terms.slice(0, 3).map(term => {
                  const returnPct = getReturnForTerm(term)
                  return (
                    <div key={term} className="text-center py-1">
                      <p className="text-gray-400 text-[11px] font-medium mb-1.5">{term} Months</p>
                      <p className={`text-xl font-bold tracking-tight ${
                        returnPct && returnPct >= 15 ? 'text-emerald-400' : 
                        returnPct && returnPct >= 10 ? 'text-amber-400' : 'text-white'
                      }`}>
                        {returnPct ? `${returnPct.toFixed(1)}%` : '—'}
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