import React, { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react'

function truncate(addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export function WalletBadge({ address, ethBalance, agroBalance, isCorrectNetwork, onDisconnect }) {
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-agro-900/60 border border-agro-700/40 hover:border-agro-500/60
                   rounded-xl px-3 py-2 transition-all duration-200 hover:bg-agro-800/60"
      >
        <div className="w-2 h-2 rounded-full bg-agro-400 animate-pulse" />
        <span className="text-white font-mono text-sm">{truncate(address)}</span>
        {!isCorrectNetwork && (
          <AlertTriangle size={14} className="text-gold-400" />
        )}
        <ChevronDown
          size={14}
          className={`text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 z-40 rounded-2xl
                          bg-agro-950/95 border border-agro-700/40 backdrop-blur-xl shadow-glass overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-agro-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs">Carteira Conectada</p>
                  <p className="text-white font-mono text-sm font-medium">{truncate(address)}</p>
                </div>
              </div>
            </div>

            {/* Network warning */}
            {!isCorrectNetwork && (
              <div className="mx-3 mt-3 p-3 bg-gold-900/30 border border-gold-700/40 rounded-xl flex items-center gap-2">
                <AlertTriangle size={14} className="text-gold-400 flex-shrink-0" />
                <p className="text-gold-300 text-xs">Rede incorreta — conecte à Sepolia</p>
              </div>
            )}

            {/* Balances */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                <span className="text-white/50 text-xs">ETH</span>
                <span className="text-white font-semibold text-sm">{ethBalance} ETH</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-agro-900/40">
                <span className="text-white/50 text-xs">AGRO Token</span>
                <span className="text-agro-400 font-semibold text-sm">{agroBalance} AGRO</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 space-y-1">
              <button
                onClick={copy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-white/70 hover:text-white text-sm"
              >
                {copied ? <CheckCircle size={15} className="text-agro-400" /> : <Copy size={15} />}
                {copied ? 'Copiado!' : 'Copiar endereço'}
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-white/70 hover:text-white text-sm"
              >
                <ExternalLink size={15} />
                Ver no Etherscan
              </a>
              <button
                onClick={() => { onDisconnect(); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-900/20 transition-colors text-red-400/70 hover:text-red-400 text-sm"
              >
                <LogOut size={15} />
                Desconectar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
