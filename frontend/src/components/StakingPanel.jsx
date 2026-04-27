import React, { useState } from 'react'
import {
  Layers3, TrendingUp, DollarSign, Clock, AlertTriangle,
  CheckCircle2, Coins, ArrowDownToLine, ArrowUpFromLine, Info,
} from 'lucide-react'
import { Card, CardHeader } from './ui/Card'
import { Button } from './ui/Button'

function Toast({ message, type, onClose }) {
  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl shadow-glass
      border max-w-sm animate-slide-up
      ${type === 'success'
        ? 'bg-agro-950/95 border-agro-700/50 text-agro-300'
        : 'bg-red-950/95 border-red-700/50 text-red-300'
      }
    `}>
      {type === 'success'
        ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
        : <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{type === 'success' ? 'Sucesso!' : 'Erro'}</p>
        <p className="text-xs opacity-80 mt-0.5 break-all">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/30 hover:text-white/60 flex-shrink-0">✕</button>
    </div>
  )
}

function formatDate(timestamp) {
  if (!timestamp || timestamp === 0) return '—'
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function daysStaked(since) {
  if (!since || since === 0) return 0
  const diff = Date.now() / 1000 - since
  return Math.floor(diff / 86400)
}

export function StakingPanel({ contracts, wallet }) {
  const [amount,        setAmount]        = useState('')
  const [stakeLoading,  setStakeLoading]  = useState(false)
  const [unstakeLoading,setUnstakeLoading]= useState(false)
  const [toast,         setToast]         = useState(null)

  const { isConnected } = wallet
  const {
    agroBalance, totalStaked, ethUsdPrice,
    userStake, userReward,
    stakeTokens, unstakeTokens,
  } = contracts

  const hasActiveStake = parseFloat(userStake.amount) > 0

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 8000)
  }

  const handleStake = async (e) => {
    e.preventDefault()
    if (!isConnected) { showToast('Conecte sua carteira MetaMask.', 'error'); return }
    const val = parseFloat(amount)
    if (!val || val <= 0) { showToast('Informe uma quantidade válida de AGRO.', 'error'); return }
    if (val > parseFloat(agroBalance)) {
      showToast(`Saldo insuficiente. Você tem ${agroBalance} AGRO.`, 'error')
      return
    }
    setStakeLoading(true)
    try {
      const hash = await stakeTokens(amount)
      showToast(`Stake realizado! TX: ${hash.slice(0,18)}...`)
      setAmount('')
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao fazer stake.'
      showToast(
        msg.includes('user rejected') ? 'Transação cancelada.' : msg.slice(0, 150),
        'error'
      )
    } finally {
      setStakeLoading(false)
    }
  }

  const handleUnstake = async () => {
    if (!isConnected) { showToast('Conecte sua carteira MetaMask.', 'error'); return }
    if (!hasActiveStake) { showToast('Você não possui stake ativo.', 'error'); return }
    setUnstakeLoading(true)
    try {
      const hash = await unstakeTokens()
      showToast(`Retirada realizada! Recompensa recebida. TX: ${hash.slice(0,18)}...`)
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao retirar stake.'
      showToast(
        msg.includes('user rejected') ? 'Transação cancelada.' : msg.slice(0, 150),
        'error'
      )
    } finally {
      setUnstakeLoading(false)
    }
  }

  const days = daysStaked(userStake.since)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-glow-gold">
          <Layers3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Pool de Liquidez</h1>
          <p className="text-white/40 text-sm">Faça stake de tokens AGRO e receba recompensas via Chainlink</p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-gold-900/30 border border-gold-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total em Stake</p>
          <p className="text-2xl font-bold text-gradient-gold">{totalStaked}</p>
          <p className="text-white/30 text-xs mt-1">AGRO no protocolo</p>
        </div>
        <div className="rounded-2xl p-4 bg-blue-900/30 border border-blue-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">ETH / USD</p>
          <p className="text-2xl font-bold text-blue-300">${ethUsdPrice}</p>
          <p className="text-white/30 text-xs mt-1">Chainlink Oráculo</p>
        </div>
        <div className="rounded-2xl p-4 bg-agro-900/40 border border-agro-700/30 col-span-2 lg:col-span-1">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Seu Saldo AGRO</p>
          <p className="text-2xl font-bold text-gradient-green">{isConnected ? agroBalance : '—'}</p>
          <p className="text-white/30 text-xs mt-1">Disponível para stake</p>
        </div>
      </div>

      {/* Your stake info */}
      {isConnected && (
        <Card glow={hasActiveStake}>
          <CardHeader
            title="Seu Stake Ativo"
            subtitle={hasActiveStake ? `Em stake há ${days} dia(s)` : 'Nenhum stake ativo'}
            icon={Layers3}
          />
          {hasActiveStake ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-agro-900/40 border border-agro-700/25">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={14} className="text-agro-400" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Staked</p>
                </div>
                <p className="text-xl font-bold text-gradient-green">{userStake.amount}</p>
                <p className="text-white/30 text-xs mt-0.5">AGRO tokens</p>
              </div>
              <div className="p-4 rounded-xl bg-gold-900/30 border border-gold-700/25">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-gold-400" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Recompensa</p>
                </div>
                <p className="text-xl font-bold text-gradient-gold">{userReward}</p>
                <p className="text-white/30 text-xs mt-0.5">AGRO acumulados</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-white/40" />
                  <p className="text-white/50 text-xs uppercase tracking-wider">Início</p>
                </div>
                <p className="text-sm font-semibold text-white">{formatDate(userStake.since)}</p>
                <p className="text-white/30 text-xs mt-0.5">{days} dia(s) em pool</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Layers3 size={22} className="text-white/20" />
              </div>
              <p className="text-white/40 font-medium">Nenhum stake ativo</p>
              <p className="text-white/25 text-sm mt-1">Faça stake para começar a acumular recompensas</p>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake Form */}
        <Card>
          <CardHeader
            title="Fazer Stake"
            subtitle="Deposite AGRO no pool de liquidez"
            icon={ArrowDownToLine}
          />
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Quantidade (AGRO)
                </label>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => setAmount(agroBalance)}
                    className="text-agro-400 text-xs hover:text-agro-300 transition-colors font-medium"
                  >
                    Máx: {agroBalance}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pr-16 text-lg"
                  disabled={stakeLoading}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                  AGRO
                </span>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-agro-400/70 text-xs mt-1.5">
                  ≈ USD {(parseFloat(amount) * parseFloat(ethUsdPrice) * 0.001).toFixed(2)} (estimativa)
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/3 border border-white/8 space-y-1.5 text-xs text-white/40">
              <p>1. Aprova o contrato de staking a gastar seus AGRO (approve)</p>
              <p>2. Envia os tokens para o pool (stake)</p>
              <p className="text-agro-400/60">Duas transações serão solicitadas</p>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              fullWidth
              loading={stakeLoading}
              disabled={!isConnected || stakeLoading}
              icon={ArrowDownToLine}
            >
              {stakeLoading ? 'Processando...' : 'Fazer Stake'}
            </Button>
          </form>
        </Card>

        {/* Unstake */}
        <Card>
          <CardHeader
            title="Retirar + Recompensa"
            subtitle="Unstake todos os tokens + coleta recompensa"
            icon={ArrowUpFromLine}
          />
          <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Coins size={14} />
                  <span>Principal</span>
                </div>
                <span className="text-white font-semibold">
                  {hasActiveStake ? `${userStake.amount} AGRO` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gold-900/20 border border-gold-700/20">
                <div className="flex items-center gap-2 text-gold-400/70 text-sm">
                  <TrendingUp size={14} />
                  <span>Recompensa</span>
                </div>
                <span className="text-gold-400 font-semibold">
                  {hasActiveStake ? `+ ${userReward} AGRO` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-agro-900/40 border border-agro-600/30">
                <span className="text-agro-300 text-sm font-medium">Total a receber</span>
                <span className="text-agro-300 font-bold">
                  {hasActiveStake
                    ? `${(parseFloat(userStake.amount) + parseFloat(userReward)).toFixed(4)} AGRO`
                    : '—'
                  }
                </span>
              </div>
            </div>

            {!hasActiveStake && isConnected && (
              <div className="flex items-center gap-2 p-3 bg-white/3 border border-white/8 rounded-xl">
                <Info size={14} className="text-white/30 flex-shrink-0" />
                <p className="text-white/30 text-xs">Você precisa ter stake ativo para retirar.</p>
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              fullWidth
              loading={unstakeLoading}
              disabled={!isConnected || !hasActiveStake || unstakeLoading}
              onClick={handleUnstake}
              icon={ArrowUpFromLine}
            >
              {unstakeLoading ? 'Retirando...' : 'Retirar Stake + Recompensa'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Reward formula */}
      <Card>
        <CardHeader
          title="Fórmula de Recompensa"
          subtitle="Como o protocolo calcula seus rendimentos"
          icon={TrendingUp}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Base Rate', value: '1% a.a.', desc: 'Taxa base do protocolo', color: 'text-agro-400' },
            { label: 'Fator Chainlink', value: 'ETH/USD', desc: `Preço atual: $${ethUsdPrice}`, color: 'text-blue-400' },
            { label: 'Tempo em Pool', value: 'Pro-rata', desc: 'Calculado por segundo', color: 'text-gold-400' },
          ].map(({ label, value, desc, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8 text-center">
              <p className="text-white/40 text-xs mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-white/25 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-agro-950/60 border border-agro-800/30 rounded-xl">
          <p className="text-white/50 text-xs font-mono text-center">
            recompensa = (amount × 0.01 × tempo_em_segundos / 365 days) × (ethUsdPrice / 1e8)
          </p>
          <p className="text-white/25 text-xs text-center mt-1">
            O oráculo Chainlink ajusta a recompensa dinamicamente ao preço do ETH em tempo real
          </p>
        </div>
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
