import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sprout, LayoutDashboard, Image, Layers3, Vote,
  ExternalLink, X, Leaf, Shield,
} from 'lucide-react'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',       desc: 'Visão geral' },
  { to: '/nft',        icon: Image,           label: 'Títulos Rurais',  desc: 'NFTs de imóveis' },
  { to: '/staking',    icon: Layers3,         label: 'Pool de Liquidez',desc: 'Stake & Recompensas' },
  { to: '/governance', icon: Vote,            label: 'Governança DAO',  desc: 'Propostas & Votos' },
]

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col
        bg-agro-950/95 border-r border-white/5 backdrop-blur-xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-agro-gradient flex items-center justify-center shadow-glow-green">
                <Sprout size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gold-500 rounded-full border-2 border-agro-950" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">AgroCredit</h1>
              <p className="text-agro-400 text-xs mt-0.5">Crédito Rural Web3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-white/25 text-xs uppercase tracking-widest font-medium px-3 mb-3">
            Protocolo
          </p>
          {navItems.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-agro-800/60 border border-agro-700/40 shadow-glow-green'
                  : 'hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${isActive ? 'bg-agro-600 text-white' : 'bg-white/5 text-white/40 group-hover:bg-agro-900/60 group-hover:text-agro-400'}
                  `}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                      {label}
                    </p>
                    <p className={`text-xs truncate ${isActive ? 'text-agro-300/70' : 'text-white/30'}`}>
                      {desc}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-agro-400 flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Network badge */}
          <div className="flex items-center justify-between px-3 py-2 bg-agro-900/40 rounded-xl border border-agro-700/20">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-agro-400 animate-pulse" />
              <span className="text-white/60 text-xs">Sepolia Testnet</span>
            </div>
            <span className="text-agro-400 text-xs font-mono">#11155111</span>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center p-2.5 bg-white/3 rounded-xl border border-white/5">
              <Leaf size={14} className="text-agro-400 mb-1" />
              <span className="text-white/30 text-xs text-center leading-tight">Token AGRO</span>
            </div>
            <div className="flex flex-col items-center p-2.5 bg-white/3 rounded-xl border border-white/5">
              <Shield size={14} className="text-gold-400 mb-1" />
              <span className="text-white/30 text-xs text-center leading-tight">DAO Gov.</span>
            </div>
          </div>

          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-white/25 hover:text-white/50
                       text-xs transition-colors"
          >
            <ExternalLink size={11} />
            Sepolia Etherscan
          </a>
        </div>
      </aside>
    </>
  )
}
