import React from 'react'

export function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card p-6
        ${glow ? 'border-glow-green' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-agro-900/60 rounded-lg">
            <Icon size={20} className="text-agro-400" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-white text-lg">{title}</h3>
          {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
