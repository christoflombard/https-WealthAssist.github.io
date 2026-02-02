'use client'

import { ProductType, OpportunityStatus } from '@/lib/supabase/database.types'
import { Search, Filter, X } from 'lucide-react'

interface FiltersProps {
  filters: {
    search: string
    productType: ProductType | ''
    province: string
    status: OpportunityStatus | ''
    minInvestment: string
    maxInvestment: string
  }
  onFilterChange: (filters: FiltersProps['filters']) => void
  provinces: string[]
}

const productTypes: { value: ProductType; label: string }[] = [
  { value: 'JV_FLIP', label: 'JV Flip' },
  { value: 'INSTALMENT_SALE_RECOVERY', label: 'Instalment Sale Recovery' },
  { value: 'RECOVERY', label: 'Recovery' },
  { value: 'RENTAL_INCOME', label: 'Rental Income' },
  { value: 'DEVELOPMENT', label: 'Development' },
]

const statuses: { value: OpportunityStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
]

export function OpportunityFilters({ filters, onFilterChange, provinces }: FiltersProps) {
  const hasActiveFilters = filters.productType || filters.province || filters.status || 
    filters.minInvestment || filters.maxInvestment

  const clearFilters = () => {
    onFilterChange({
      search: filters.search,
      productType: '',
      province: '',
      status: '',
      minInvestment: '',
      maxInvestment: '',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, deal code..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filters.productType}
            onChange={(e) => onFilterChange({ ...filters, productType: e.target.value as ProductType | '' })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">All Types</option>
            {productTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={filters.province}
            onChange={(e) => onFilterChange({ ...filters, province: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">All Provinces</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as OpportunityStatus | '' })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="">All Status</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min R"
              value={filters.minInvestment}
              onChange={(e) => onFilterChange({ ...filters, minInvestment: e.target.value })}
              className="w-28 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max R"
              value={filters.maxInvestment}
              onChange={(e) => onFilterChange({ ...filters, maxInvestment: e.target.value })}
              className="w-28 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}