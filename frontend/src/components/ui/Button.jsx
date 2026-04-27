import React from 'react'
import { Loader2 } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-agro-600 hover:bg-agro-500 text-white shadow-glow-green hover:shadow-lg active:scale-95',
    secondary: 'bg-gold-700 hover:bg-gold-600 text-white shadow-glow-gold hover:shadow-lg active:scale-95',
    outline:   'border border-agro-600/60 text-agro-400 hover:bg-agro-900/50 hover:border-agro-500 active:scale-95',
    danger:    'bg-red-900/60 border border-red-700/50 text-red-400 hover:bg-red-800/60 active:scale-95',
    ghost:     'text-white/60 hover:text-white hover:bg-white/5 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  )
}
