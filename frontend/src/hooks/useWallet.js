import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider, formatEther } from 'ethers'
import { CHAIN_ID, SEPOLIA_PARAMS } from '../config/contracts'

export function useWallet() {
  const [provider, setProvider]     = useState(null)
  const [signer, setSigner]         = useState(null)
  const [address, setAddress]       = useState(null)
  const [chainId, setChainId]       = useState(null)
  const [ethBalance, setEthBalance] = useState('0')
  const [connecting, setConnecting] = useState(false)
  const [error, setError]           = useState(null)

  const isConnected = Boolean(address)
  const isCorrectNetwork = chainId === CHAIN_ID

  const fetchEthBalance = useCallback(async (prov, addr) => {
    try {
      const bal = await prov.getBalance(addr)
      setEthBalance(parseFloat(formatEther(bal)).toFixed(4))
    } catch {
      setEthBalance('0')
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask não encontrada. Instale a extensão MetaMask.')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const prov = new BrowserProvider(window.ethereum)
      const accounts = await prov.send('eth_requestAccounts', [])
      if (!accounts.length) throw new Error('Nenhuma conta autorizada.')

      const network = await prov.getNetwork()
      const currentChainId = Number(network.chainId)
      setChainId(currentChainId)

      if (currentChainId !== CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_PARAMS.chainId }],
          })
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SEPOLIA_PARAMS],
            })
          } else {
            throw switchErr
          }
        }
        // re-fetch after switch
        const freshProv = new BrowserProvider(window.ethereum)
        const freshNet  = await freshProv.getNetwork()
        setChainId(Number(freshNet.chainId))
        const freshSigner = await freshProv.getSigner()
        const freshAddr   = await freshSigner.getAddress()
        setProvider(freshProv)
        setSigner(freshSigner)
        setAddress(freshAddr)
        await fetchEthBalance(freshProv, freshAddr)
        return
      }

      const sig  = await prov.getSigner()
      const addr = await sig.getAddress()
      setProvider(prov)
      setSigner(sig)
      setAddress(addr)
      await fetchEthBalance(prov, addr)
    } catch (err) {
      const msg = err?.reason || err?.message || 'Erro ao conectar carteira.'
      setError(msg.includes('user rejected') ? 'Conexão cancelada pelo usuário.' : msg)
    } finally {
      setConnecting(false)
    }
  }, [fetchEthBalance])

  const disconnect = useCallback(() => {
    setProvider(null)
    setSigner(null)
    setAddress(null)
    setChainId(null)
    setEthBalance('0')
    setError(null)
  }, [])

  // Listen for MetaMask events
  useEffect(() => {
    if (!window.ethereum) return
    const onAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        disconnect()
      } else {
        const prov = new BrowserProvider(window.ethereum)
        const sig  = await prov.getSigner()
        const addr = await sig.getAddress()
        setProvider(prov)
        setSigner(sig)
        setAddress(addr)
        await fetchEthBalance(prov, addr)
      }
    }
    const onChainChanged = () => { window.location.reload() }

    window.ethereum.on('accountsChanged', onAccountsChanged)
    window.ethereum.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener('chainChanged', onChainChanged)
    }
  }, [disconnect, fetchEthBalance])

  // Auto-reconnect if already authorized
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length) await connect()
      } catch {
        // silently fail
      }
    }
    autoConnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    provider,
    signer,
    address,
    chainId,
    ethBalance,
    connecting,
    error,
    isConnected,
    isCorrectNetwork,
    connect,
    disconnect,
    setError,
  }
}
