import React from 'react'
import { TrendingUp } from 'lucide-react'

export function StatCard({ label, value, unit = '', icon: Icon, trend, color = 'green', loading = false }) {
  const colors = {
    green: {
      bg:    'bg-agro-900/40',
      icon:  'bg-agro-800/60 text-agro-400',
      value: 'text-gradient-green',
      border: 'border-agro-700/30',
    },
    gold: {
      bg:    'bg-gold-900/30',
      icon:  'bg-gold-800/40 text-gold-400',
      value: 'text-gradient-gold',
      border: 'border-gold-700/30',
    },
    white: {
      bg:    'bg-white/5',
      icon:  'bg-white/10 text-white/60',
      value: 'text-white',
      border: 'border-white/10',
    },
    blue: {
      bg:    'bg-blue-900/30',
      icon:  'bg-blue-800/40 text-blue-400',
      value: 'text-blue-300',
      border: 'border-blue-700/30',
    },
  }

  const c = colors[color] || colors.green

  return (
    <div className={`rounded-2xl p-5 border ${c.bg} ${c.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${c.icon}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold ${c.value}`}>{value}</span>
          {unit && <span className="text-white/40 text-sm font-medium">{unit}</span>}
        </div>
      )}

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp size={12} className="text-agro-400" />
          <span className="text-agro-400 text-xs">{trend}</span>
        </div>
      )}
    </div>
  )
}
