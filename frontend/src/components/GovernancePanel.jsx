import React, { useState } from 'react'
import {
  Vote, Plus, ThumbsUp, ThumbsDown, CheckCircle2, AlertTriangle,
  Clock, User, BarChart3, Play, Info, Zap,
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

function ProposalStatus({ deadline, executed }) {
  const now = Date.now() / 1000
  const isActive   = !executed && deadline > now
  const isEnded    = !executed && deadline <= now
  if (executed) return (
    <span className="badge-executed flex items-center gap-1">
      <CheckCircle2 size={10} /> Executada
    </span>
  )
  if (isActive) return (
    <span className="badge-active flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-agro-400 animate-pulse" />
      Em Votação
    </span>
  )
  return (
    <span className="badge-ended flex items-center gap-1">
      <Clock size={10} /> Encerrada
    </span>
  )
}

function VoteBar({ votesFor, votesAgainst }) {
  const total = parseFloat(votesFor) + parseFloat(votesAgainst)
  const forPct     = total > 0 ? (parseFloat(votesFor) / total) * 100 : 0
  const againstPct = total > 0 ? (parseFloat(votesAgainst) / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-agro-400 font-medium flex items-center gap-1">
          <ThumbsUp size={11} /> {parseFloat(votesFor).toFixed(2)} A favor
        </span>
        <span className="text-red-400 font-medium flex items-center gap-1">
          Contra {parseFloat(votesAgainst).toFixed(2)} <ThumbsDown size={11} />
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-agro-500 transition-all duration-500"
          style={{ width: `${forPct}%` }}
        />
        <div
          className="h-full bg-red-600 transition-all duration-500"
          style={{ width: `${againstPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs mt-1 text-white/25">
        <span>{forPct.toFixed(1)}%</span>
        <span>{total.toFixed(2)} votos totais</span>
        <span>{againstPct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function formatDeadline(deadline) {
  if (!deadline) return '—'
  const d = new Date(deadline * 1000)
  const now = Date.now()
  const diff = d.getTime() - now
  if (diff > 0) {
    const days  = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `${days}d ${hours}h restantes`
    return `${hours}h restantes`
  }
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

export function GovernancePanel({ contracts, wallet }) {
  const [description,    setDescription]    = useState('')
  const [createLoading,  setCreateLoading]  = useState(false)
  const [votingId,       setVotingId]       = useState(null)
  const [executingId,    setExecutingId]    = useState(null)
  const [toast,          setToast]          = useState(null)

  const { isConnected } = wallet
  const {
    proposals, proposalCount,
    createProposal, castVote, executeProposal,
  } = contracts

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 8000)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!isConnected) { showToast('Conecte a MetaMask.', 'error'); return }
    if (!description.trim() || description.trim().length < 10) {
      showToast('Descrição muito curta (mínimo 10 caracteres).', 'error')
      return
    }
    setCreateLoading(true)
    try {
      const hash = await createProposal(description.trim())
      showToast(`Proposta criada! TX: ${hash.slice(0,18)}...`)
      setDescription('')
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao criar proposta.'
      showToast(
        msg.includes('user rejected') ? 'Transação cancelada.' : msg.slice(0, 150),
        'error'
      )
    } finally {
      setCreateLoading(false)
    }
  }

  const handleVote = async (proposalId, support) => {
    if (!isConnected) { showToast('Conecte a MetaMask.', 'error'); return }
    setVotingId(`${proposalId}-${support}`)
    try {
      const hash = await castVote(proposalId, support)
      showToast(`Voto registrado! TX: ${hash.slice(0,18)}...`)
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao votar.'
      showToast(
        msg.includes('user rejected')        ? 'Voto cancelado pelo usuário.'     :
        msg.includes('already voted')        ? 'Você já votou nesta proposta.'    :
        msg.includes('voting period ended')  ? 'Período de votação encerrado.'    :
        msg.slice(0, 150),
        'error'
      )
    } finally {
      setVotingId(null)
    }
  }

  const handleExecute = async (proposalId) => {
    if (!isConnected) { showToast('Conecte a MetaMask.', 'error'); return }
    setExecutingId(proposalId)
    try {
      const hash = await executeProposal(proposalId)
      showToast(`Proposta executada! TX: ${hash.slice(0,18)}...`)
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao executar proposta.'
      showToast(
        msg.includes('user rejected')           ? 'Execução cancelada.'           :
        msg.includes('voting period not ended') ? 'Período de votação ainda não encerrou.' :
        msg.slice(0, 150),
        'error'
      )
    } finally {
      setExecutingId(null)
    }
  }

  const now = Date.now() / 1000

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-purple-700 flex items-center justify-center shadow-glass">
          <Vote size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Governança DAO</h1>
          <p className="text-white/40 text-sm">Propostas e votações descentralizadas on-chain</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-blue-900/30 border border-blue-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-300">{proposalCount}</p>
          <p className="text-white/30 text-xs mt-1">propostas criadas</p>
        </div>
        <div className="rounded-2xl p-4 bg-agro-900/40 border border-agro-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Ativas</p>
          <p className="text-2xl font-bold text-gradient-green">
            {proposals.filter(p => !p.executed && p.deadline > now).length}
          </p>
          <p className="text-white/30 text-xs mt-1">em votação</p>
        </div>
        <div className="rounded-2xl p-4 bg-gold-900/30 border border-gold-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Executadas</p>
          <p className="text-2xl font-bold text-gradient-gold">
            {proposals.filter(p => p.executed).length}
          </p>
          <p className="text-white/30 text-xs mt-1">aprovadas</p>
        </div>
      </div>

      {/* Create proposal */}
      <Card>
        <CardHeader
          title="Criar Nova Proposta"
          subtitle="Submeta uma proposta para votação da comunidade"
          icon={Plus}
        />
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Descrição da Proposta
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva a proposta em detalhes: ex. 'Aumentar a taxa de recompensa de staking de 1% para 2% ao ano, visando atrair mais liquidez para o protocolo AgroCredit...'"
              rows={4}
              className="input-field resize-none"
              disabled={createLoading}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-white/25 text-xs">Mínimo 10 caracteres, máximo 500</p>
              <p className={`text-xs font-mono ${description.length > 450 ? 'text-gold-400' : 'text-white/25'}`}>
                {description.length}/500
              </p>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={createLoading}
            disabled={!isConnected || createLoading}
            icon={Plus}
          >
            {createLoading ? 'Criando Proposta...' : 'Criar Proposta'}
          </Button>
          {!isConnected && (
            <p className="text-center text-white/30 text-xs">Conecte a MetaMask para criar propostas</p>
          )}
        </form>
      </Card>

      {/* Proposals list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-white/40" />
            <h2 className="text-white font-semibold">Propostas</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-xs">{proposals.length}</span>
          </div>
        </div>

        {proposals.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Vote size={28} className="text-white/20" />
              </div>
              <p className="text-white/40 font-medium">Nenhuma proposta ainda</p>
              <p className="text-white/25 text-sm mt-1">
                {isConnected
                  ? 'Seja o primeiro a criar uma proposta acima!'
                  : 'Conecte a carteira para ver e criar propostas'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const isActive   = !p.executed && p.deadline > now
              const canExecute = !p.executed && p.deadline <= now

              return (
                <Card key={p.id} className={isActive ? 'border-agro-700/30' : ''}>
                  {/* Proposal header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
                        ${isActive ? 'bg-agro-700/60 text-agro-300' : p.executed ? 'bg-gold-800/40 text-gold-400' : 'bg-white/10 text-white/40'}
                      `}>
                        #{p.id}
                      </div>
                      <div>
                        <ProposalStatus deadline={p.deadline} executed={p.executed} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/25 text-xs">
                      <Clock size={12} />
                      {formatDeadline(p.deadline)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/80 text-sm leading-relaxed mb-4">{p.description}</p>

                  {/* Proposer */}
                  <div className="flex items-center gap-1.5 text-white/30 text-xs mb-4">
                    <User size={11} />
                    Proposto por: <span className="font-mono">{p.proposer.slice(0,10)}...{p.proposer.slice(-6)}</span>
                  </div>

                  {/* Vote bar */}
                  <div className="mb-4">
                    <VoteBar votesFor={p.votesFor} votesAgainst={p.votesAgainst} />
                  </div>

                  {/* Actions */}
                  {isActive && isConnected && (
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={votingId === `${p.id}-true`}
                        disabled={!!votingId}
                        onClick={() => handleVote(p.id, true)}
                        icon={ThumbsUp}
                        className="flex-1"
                      >
                        A Favor
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={votingId === `${p.id}-false`}
                        disabled={!!votingId}
                        onClick={() => handleVote(p.id, false)}
                        icon={ThumbsDown}
                        className="flex-1"
                      >
                        Contra
                      </Button>
                    </div>
                  )}

                  {canExecute && isConnected && (
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      loading={executingId === p.id}
                      disabled={!!executingId}
                      onClick={() => handleExecute(p.id)}
                      icon={Play}
                    >
                      Executar Proposta
                    </Button>
                  )}

                  {p.executed && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gold-900/20 border border-gold-700/20 rounded-xl">
                      <Zap size={13} className="text-gold-400" />
                      <p className="text-gold-300/70 text-xs">Esta proposta foi executada com sucesso.</p>
                    </div>
                  )}

                  {!isConnected && isActive && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/3 border border-white/8 rounded-xl">
                      <Info size={13} className="text-white/30" />
                      <p className="text-white/30 text-xs">Conecte a carteira para votar</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
