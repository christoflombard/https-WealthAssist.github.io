'use client'

import { OpportunityReturnRow } from '@/lib/supabase/database.types'

interface ReturnsTableProps {
  rows: OpportunityReturnRow[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ZAR', 'R')
}

export function ReturnsTable({ rows }: ReturnsTableProps) {
  if (!rows.length) return null

  const sortedRows = [...rows].sort((a, b) => a.sort_order - b.sort_order)
  const terms = [...new Set(rows.map(r => r.term_value))].sort((a, b) => a - b)
  const termType = rows[0]?.term_type || 'MONTHS'
  const rowKeys = [...new Set(sortedRows.map(r => r.row_key))]

  const getRowData = (rowKey: string) => {
    return sortedRows.filter(r => r.row_key === rowKey)
  }

  const getLabel = (rowKey: string) => {
    return sortedRows.find(r => r.row_key === rowKey)?.label || rowKey
  }

  const isHighlightRow = (rowKey: string) => {
    return ['net_return', 'total_return', 'roi'].includes(rowKey.toLowerCase())
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-gray-600 font-medium"></th>
            {terms.map(term => (
              <th key={term} className="text-center py-2 px-2 text-gray-600 font-medium">
                {term} {termType === 'MONTHS' ? 'Months' : termType === 'YEAR' ? (term === 1 ? 'Year' : 'Years') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map(rowKey => {
            const rowData = getRowData(rowKey)
            const isHighlight = isHighlightRow(rowKey)
            return (
              <tr 
                key={rowKey} 
                className={`border-b border-gray-100 ${isHighlight ? 'bg-emerald-50 font-semibold' : ''}`}
              >
                <td className={`py-2 px-2 ${isHighlight ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {getLabel(rowKey)}
                </td>
                {terms.map(term => {
                  const cell = rowData.find(r => r.term_value === term)
                  return (
                    <td key={term} className={`text-center py-2 px-2 ${isHighlight ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {cell?.pct !== null && cell?.pct !== undefined ? (
                        <span>{cell.pct.toFixed(2)}%</span>
                      ) : cell?.amount !== null && cell?.amount !== undefined ? (
                        <span>{formatCurrency(cell.amount)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}