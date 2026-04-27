import React, { useState } from 'react'
import {
  Image, Plus, ExternalLink, AlertTriangle, CheckCircle2,
  Loader2, Tag, User, FileText, Info,
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

export function NFTPanel({ contracts, wallet }) {
  const [uri,      setUri]      = useState('')
  const [toAddr,   setToAddr]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)

  const { isConnected, address } = wallet
  const { mintNFT, nftTokenIds, nftBalance } = contracts

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 8000)
  }

  const handleMint = async (e) => {
    e.preventDefault()
    if (!isConnected) { showToast('Conecte sua carteira MetaMask primeiro.', 'error'); return }
    if (!uri.trim())  { showToast('Informe o URI do imóvel (ex: ipfs://...).', 'error'); return }
    const recipient = toAddr.trim() || address
    setLoading(true)
    try {
      const hash = await mintNFT(recipient, uri.trim())
      showToast(`NFT emitido com sucesso! TX: ${hash.slice(0,18)}...`)
      setUri('')
      setToAddr('')
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao emitir o título.'
      showToast(
        msg.includes('OwnableUnauthorizedAccount') || msg.includes('not the owner')
          ? 'Apenas o owner do contrato pode emitir títulos rurais.'
          : msg.includes('user rejected')
          ? 'Transação cancelada pelo usuário.'
          : msg.slice(0, 120),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-agro-gradient flex items-center justify-center shadow-glow-green">
            <Image size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Títulos Rurais</h1>
            <p className="text-white/40 text-sm">NFTs ERC-721 que representam imóveis rurais tokenizados</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-agro-900/40 border border-agro-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Seus NFTs</p>
          <p className="text-2xl font-bold text-gradient-green">{isConnected ? nftBalance : '—'}</p>
          <p className="text-white/30 text-xs mt-1">Títulos na sua carteira</p>
        </div>
        <div className="rounded-2xl p-4 bg-gold-900/30 border border-gold-700/30">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Padrão</p>
          <p className="text-2xl font-bold text-gradient-gold">ERC-721</p>
          <p className="text-white/30 text-xs mt-1">Token não-fungível</p>
        </div>
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10 col-span-2 lg:col-span-1">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Rede</p>
          <p className="text-2xl font-bold text-white">Sepolia</p>
          <p className="text-white/30 text-xs mt-1">Ethereum Testnet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mint Form */}
        <Card>
          <CardHeader
            title="Emitir Novo Título"
            subtitle="Tokenize um imóvel rural como NFT"
            icon={Plus}
          />

          {/* Owner notice */}
          <div className="flex items-start gap-3 p-3 bg-gold-900/20 border border-gold-700/25 rounded-xl mb-5">
            <Info size={15} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-gold-300/80 text-xs leading-relaxed">
              Somente o <strong>owner do contrato</strong> pode emitir títulos rurais.
              Conecte a carteira do deployer para usar esta função.
            </p>
          </div>

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                URI do Imóvel (IPFS)
              </label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={uri}
                  onChange={e => setUri(e.target.value)}
                  placeholder="ipfs://QmXxx... ou https://..."
                  className="input-field pl-10"
                  disabled={loading}
                />
              </div>
              <p className="text-white/25 text-xs mt-1.5">
                Aponte para um JSON com os metadados do imóvel (nome, área, coordenadas, etc.)
              </p>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Endereço Destinatário
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={toAddr}
                  onChange={e => setToAddr(e.target.value)}
                  placeholder={address || '0x... (padrão: sua carteira)'}
                  className="input-field pl-10 font-mono text-sm"
                  disabled={loading}
                />
              </div>
              <p className="text-white/25 text-xs mt-1.5">
                Deixe em branco para emitir para sua própria carteira
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!isConnected || loading}
              icon={Plus}
            >
              {loading ? 'Emitindo Título...' : 'Emitir Título Rural'}
            </Button>

            {!isConnected && (
              <p className="text-center text-white/30 text-xs">Conecte a MetaMask para continuar</p>
            )}
          </form>
        </Card>

        {/* NFT List */}
        <Card>
          <CardHeader
            title="Títulos Mintados"
            subtitle={`${nftTokenIds.length} título(s) encontrado(s)`}
            icon={Tag}
          />

          {nftTokenIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Image size={28} className="text-white/20" />
              </div>
              <p className="text-white/40 font-medium">Nenhum título encontrado</p>
              <p className="text-white/25 text-sm mt-1">
                {isConnected
                  ? 'Os NFTs aparecerão aqui após a emissão'
                  : 'Conecte a carteira para ver seus títulos'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {nftTokenIds.map(({ tokenId, owner, uri: tokenUri }) => (
                <div
                  key={tokenId}
                  className="p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-agro-gradient flex items-center justify-center flex-shrink-0">
                        <Image size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Título #{tokenId}</p>
                        <p className="text-white/35 text-xs font-mono mt-0.5">
                          {owner.slice(0,8)}...{owner.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/token/${window.location.origin}?a=${tokenId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/25 hover:text-agro-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  {tokenUri && (
                    <div className="mt-2 px-3 py-1.5 bg-white/5 rounded-lg">
                      <p className="text-white/30 text-xs font-mono truncate">{tokenUri}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-agro-900/60 rounded-xl flex-shrink-0">
            <Info size={18} className="text-agro-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Sobre os Títulos Rurais</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Cada NFT representa um imóvel rural tokenizado na blockchain. O URI aponta para um arquivo JSON
              (preferencialmente no IPFS) contendo os metadados do imóvel: nome, área em hectares,
              coordenadas GPS, matrícula no cartório, e documentação digitalizada. Esses títulos podem
              ser utilizados como garantia em operações de crédito rural descentralizado.
            </p>
          </div>
        </div>
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
