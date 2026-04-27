import React from 'react'
import { Sprout, Wallet, Loader2, AlertTriangle, Menu } from 'lucide-react'
import { WalletBadge } from './WalletBadge'

export function Navbar({ wallet, agroBalance, onMenuToggle }) {
  const { address, ethBalance, isConnected, isCorrectNetwork, connecting, connect, disconnect } = wallet

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-16 flex items-center
                        px-4 lg:px-6 border-b border-white/5 bg-agro-950/80 backdrop-blur-xl">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden mr-3 p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Logo (mobile only) */}
      <div className="lg:hidden flex items-center gap-2 mr-auto">
        <div className="w-7 h-7 bg-agro-gradient rounded-lg flex items-center justify-center">
          <Sprout size={14} className="text-white" />
        </div>
        <span className="font-bold text-white text-sm">AgroCredit</span>
      </div>

      {/* Spacer on desktop */}
      <div className="hidden lg:block flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={connecting}
            className="flex items-center gap-2 bg-agro-600 hover:bg-agro-500 disabled:opacity-60
                       text-white font-semibold px-4 py-2 rounded-xl text-sm
                       transition-all duration-200 shadow-glow-green"
          >
            {connecting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Wallet size={15} />
            )}
            {connecting ? 'Conectando...' : 'Conectar MetaMask'}
          </button>
        ) : (
          <WalletBadge
            address={address}
            ethBalance={ethBalance}
            agroBalance={agroBalance}
            isCorrectNetwork={isCorrectNetwork}
            onDisconnect={disconnect}
          />
        )}

        {isConnected && !isCorrectNetwork && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-900/40 border border-gold-700/40 rounded-lg">
            <AlertTriangle size={13} className="text-gold-400" />
            <span className="text-gold-300 text-xs font-medium">Sepolia</span>
          </div>
        )}
      </div>
    </header>
  )
}
