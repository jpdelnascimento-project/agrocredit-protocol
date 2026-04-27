import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Coins, Layers3, DollarSign, Vote, ArrowRight,
  Sprout, Image, Shield, TrendingUp, Info, Leaf,
  Globe, Lock, Zap,
} from 'lucide-react'
import { StatCard } from './ui/StatCard'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ADDRESSES } from '../config/contracts'

function shortAddr(addr) {
  return addr.slice(0, 8) + '...' + addr.slice(-6)
}

export function Dashboard({ contracts, isConnected }) {
  const navigate = useNavigate()
  const { agroBalance, totalStaked, ethUsdPrice, proposalCount, loading } = contracts

  const quickActions = [
    {
      icon: Image,
      label: 'Emitir Título Rural',
      desc: 'Tokenize um imóvel como NFT',
      to: '/nft',
      color: 'from-agro-800/60 to-agro-900/60',
      border: 'border-agro-700/30',
      iconColor: 'text-agro-400',
    },
    {
      icon: Layers3,
      label: 'Fazer Stake',
      desc: 'Forneça liquidez e ganhe recompensas',
      to: '/staking',
      color: 'from-gold-900/40 to-gold-950/60',
      border: 'border-gold-700/30',
      iconColor: 'text-gold-400',
    },
    {
      icon: Vote,
      label: 'Votar na DAO',
      desc: 'Participe das decisões do protocolo',
      to: '/governance',
      color: 'from-blue-900/30 to-blue-950/50',
      border: 'border-blue-700/30',
      iconColor: 'text-blue-400',
    },
  ]

  const contracts_info = [
    { label: 'AgroToken (ERC-20)',  addr: ADDRESSES.TOKEN,      color: 'text-agro-400' },
    { label: 'AgroNFT (ERC-721)',   addr: ADDRESSES.NFT,        color: 'text-gold-400' },
    { label: 'AgroStaking',         addr: ADDRESSES.STAKING,    color: 'text-blue-400' },
    { label: 'AgroGovernance (DAO)',addr: ADDRESSES.GOVERNANCE, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-agro-gradient opacity-90" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}} />
        <div className="relative px-8 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 bg-white/15 rounded-full text-white/80 text-xs font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-agro-300 animate-pulse" />
                Sepolia Testnet · Ao Vivo
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              Crédito Rural
              <br />
              <span className="text-agro-200">Descentralizado</span>
            </h1>
            <p className="text-white/70 mt-3 max-w-xl text-sm leading-relaxed">
              AgroCredit é um protocolo DeFi que democratiza o acesso a crédito rural no Brasil.
              Tokenize imóveis como NFTs, faça stake de tokens AGRO para gerar recompensas calibradas
              pelo oráculo Chainlink, e participe da governança descentralizada.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            {[
              { icon: Leaf,   text: 'Token AGRO ERC-20' },
              { icon: Lock,   text: 'Staking com Chainlink' },
              { icon: Globe,  text: 'Governança DAO On-chain' },
              { icon: Zap,    text: 'NFTs de Títulos Rurais' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-white/80 text-sm">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-white" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
          Métricas do Protocolo
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Saldo AGRO"
            value={isConnected ? agroBalance : '—'}
            unit="AGRO"
            icon={Coins}
            color="green"
            loading={loading && isConnected}
            trend={isConnected ? 'Sua carteira' : 'Conecte a carteira'}
          />
          <StatCard
            label="Total em Stake"
            value={totalStaked}
            unit="AGRO"
            icon={Layers3}
            color="gold"
            loading={loading}
            trend="Pool de liquidez"
          />
          <StatCard
            label="ETH / USD"
            value={ethUsdPrice === '0' && loading ? '...' : `$${ethUsdPrice}`}
            icon={DollarSign}
            color="blue"
            loading={loading}
            trend="Via Chainlink Sepolia"
          />
          <StatCard
            label="Propostas DAO"
            value={proposalCount}
            unit="proposta(s)"
            icon={Vote}
            color="white"
            loading={loading}
            trend="Governança ativa"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ icon: Icon, label, desc, to, color, border, iconColor }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`
                group relative p-5 rounded-2xl border ${border}
                bg-gradient-to-br ${color} backdrop-blur-sm
                hover:scale-[1.02] transition-all duration-300 text-left
                hover:shadow-glass
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 bg-white/10 rounded-xl ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-200"
                />
              </div>
              <p className="text-white font-semibold text-base">{label}</p>
              <p className="text-white/50 text-xs mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Contracts + How it Works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* How it works */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-agro-900/60 rounded-lg">
              <Info size={18} className="text-agro-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Como Funciona</h3>
              <p className="text-white/40 text-xs">Fluxo do protocolo AgroCredit</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Conecte sua carteira MetaMask',
                desc: 'Autorize o AgroCredit na rede Sepolia para começar.',
                icon: Shield,
              },
              {
                step: '02',
                title: 'Emita um Título Rural (NFT)',
                desc: 'O proprietário minta um NFT vinculado ao imóvel rural (URI IPFS).',
                icon: Image,
              },
              {
                step: '03',
                title: 'Faça stake de tokens AGRO',
                desc: 'Deposite AGRO no pool e receba recompensas calculadas pelo oráculo Chainlink.',
                icon: TrendingUp,
              },
              {
                step: '04',
                title: 'Participe da Governança',
                desc: 'Crie e vote em propostas que definem os rumos do protocolo.',
                icon: Vote,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-agro-900/60 border border-agro-700/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-agro-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-agro-500/60 text-xs font-mono">{step}</span>
                    <p className="text-white text-sm font-medium">{title}</p>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Contracts */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-agro-900/60 rounded-lg">
              <Sprout size={18} className="text-agro-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Contratos Deployados</h3>
              <p className="text-white/40 text-xs">Sepolia Testnet · Verificados</p>
            </div>
          </div>
          <div className="space-y-3">
            {contracts_info.map(({ label, addr, color }) => (
              <a
                key={addr}
                href={`https://sepolia.etherscan.io/address/${addr}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5
                           hover:bg-white/6 hover:border-white/10 transition-all duration-200 group"
              >
                <div>
                  <p className={`text-sm font-medium ${color}`}>{label}</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">{shortAddr(addr)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-agro-500 opacity-70" />
                  <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">Etherscan</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 bg-agro-900/30 rounded-xl border border-agro-700/20">
              <div className="w-1.5 h-1.5 rounded-full bg-agro-400 animate-pulse" />
              <p className="text-white/50 text-xs">
                Chainlink ETH/USD: <span className="text-agro-300 font-mono">{shortAddr(ADDRESSES.CHAINLINK)}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Connect CTA if not connected */}
      {!isConnected && (
        <div className="rounded-2xl p-6 bg-gradient-to-r from-agro-900/50 to-agro-800/30
                        border border-agro-700/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agro-600/30 border border-agro-500/30 flex items-center justify-center">
              <Shield size={20} className="text-agro-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Carteira não conectada</p>
              <p className="text-white/50 text-sm">Conecte sua MetaMask para interagir com o protocolo</p>
            </div>
          </div>
          <Button variant="primary" size="lg" icon={Sprout}>
            Conectar Agora
          </Button>
        </div>
      )}
    </div>
  )
}
