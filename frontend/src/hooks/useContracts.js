import { useState, useEffect, useCallback } from 'react'
import { Contract, formatUnits, parseUnits } from 'ethers'
import {
  ADDRESSES,
  TOKEN_ABI,
  NFT_ABI,
  STAKING_ABI,
  GOVERNANCE_ABI,
} from '../config/contracts'

export function useContracts(provider, signer, address) {
  const [agroBalance,    setAgroBalance]    = useState('0')
  const [totalStaked,    setTotalStaked]    = useState('0')
  const [ethUsdPrice,    setEthUsdPrice]    = useState('0')
  const [proposalCount,  setProposalCount]  = useState(0)
  const [userStake,      setUserStake]      = useState({ amount: '0', since: 0 })
  const [userReward,     setUserReward]     = useState('0')
  const [proposals,      setProposals]      = useState([])
  const [nftBalance,     setNftBalance]     = useState('0')
  const [loading,        setLoading]        = useState(false)
  const [nftTokenIds,    setNftTokenIds]    = useState([])

  const getReadContract = useCallback((abi, contractAddress) => {
    if (!provider) return null
    return new Contract(contractAddress, abi, provider)
  }, [provider])

  const getWriteContract = useCallback((abi, contractAddress) => {
    if (!signer) return null
    return new Contract(contractAddress, abi, signer)
  }, [signer])

  const fetchGlobalStats = useCallback(async () => {
    if (!provider) return
    try {
      const stakingContract = getReadContract(STAKING_ABI, ADDRESSES.STAKING)
      if (!stakingContract) return

      const [staked, ethPrice, govCount] = await Promise.allSettled([
        stakingContract.totalStaked(),
        stakingContract.getEthUsdPrice(),
        new Contract(ADDRESSES.GOVERNANCE, GOVERNANCE_ABI, provider).proposalCount(),
      ])

      if (staked.status === 'fulfilled') {
        setTotalStaked(parseFloat(formatUnits(staked.value, 18)).toFixed(2))
      }
      if (ethPrice.status === 'fulfilled') {
        setEthUsdPrice((Number(ethPrice.value) / 1e8).toFixed(2))
      }
      if (govCount.status === 'fulfilled') {
        setProposalCount(Number(govCount.value))
      }
    } catch (err) {
      console.error('fetchGlobalStats error:', err)
    }
  }, [provider, getReadContract])

  const fetchUserData = useCallback(async () => {
    if (!provider || !address) return
    try {
      const tokenContract = getReadContract(TOKEN_ABI, ADDRESSES.TOKEN)
      const stakingContract = getReadContract(STAKING_ABI, ADDRESSES.STAKING)
      const nftContract = getReadContract(NFT_ABI, ADDRESSES.NFT)
      if (!tokenContract || !stakingContract || !nftContract) return

      const [bal, stakeInfo, reward, nftBal] = await Promise.allSettled([
        tokenContract.balanceOf(address),
        stakingContract.stakes(address),
        stakingContract.calculateReward(address),
        nftContract.balanceOf(address),
      ])

      if (bal.status === 'fulfilled') {
        setAgroBalance(parseFloat(formatUnits(bal.value, 18)).toFixed(2))
      }
      if (stakeInfo.status === 'fulfilled') {
        setUserStake({
          amount: parseFloat(formatUnits(stakeInfo.value.amount, 18)).toFixed(2),
          since: Number(stakeInfo.value.since),
        })
      }
      if (reward.status === 'fulfilled') {
        setUserReward(parseFloat(formatUnits(reward.value, 18)).toFixed(4))
      }
      if (nftBal.status === 'fulfilled') {
        setNftBalance(nftBal.value.toString())
      }
    } catch (err) {
      console.error('fetchUserData error:', err)
    }
  }, [provider, address, getReadContract])

  const fetchProposals = useCallback(async () => {
    if (!provider) return
    try {
      const govContract = getReadContract(GOVERNANCE_ABI, ADDRESSES.GOVERNANCE)
      if (!govContract) return
      const count = Number(await govContract.proposalCount())
      setProposalCount(count)
      if (count === 0) { setProposals([]); return }

      const list = []
      for (let i = 1; i <= count; i++) {
        try {
          const p = await govContract.getProposal(i)
          list.push({
            id:           Number(p.id),
            proposer:     p.proposer,
            description:  p.description,
            votesFor:     parseFloat(formatUnits(p.votesFor, 18)).toFixed(2),
            votesAgainst: parseFloat(formatUnits(p.votesAgainst, 18)).toFixed(2),
            deadline:     Number(p.deadline),
            executed:     p.executed,
          })
        } catch {
          // skip bad proposal
        }
      }
      setProposals(list.reverse())
    } catch (err) {
      console.error('fetchProposals error:', err)
    }
  }, [provider, getReadContract])

  const fetchNftTokenIds = useCallback(async () => {
    if (!provider || !address) return
    try {
      const nftContract = getReadContract(NFT_ABI, ADDRESSES.NFT)
      if (!nftContract) return

      // Listen to Transfer events to find tokens owned by address
      const filter = nftContract.filters.Transfer(null, null, null)
      const events = await nftContract.queryFilter(filter, -50000)
      const owned = []
      const seen = new Set()

      for (const ev of events) {
        const tokenId = Number(ev.args.tokenId)
        if (!seen.has(tokenId)) {
          seen.add(tokenId)
          try {
            const owner = await nftContract.ownerOf(tokenId)
            if (owner.toLowerCase() === address.toLowerCase()) {
              let uri = ''
              try { uri = await nftContract.tokenURI(tokenId) } catch {}
              owned.push({ tokenId, owner, uri })
            }
          } catch {}
        }
      }
      setNftTokenIds(owned)
    } catch (err) {
      console.error('fetchNftTokenIds error:', err)
    }
  }, [provider, address, getReadContract])

  // ─── WRITE ACTIONS ───────────────────────────────────────────────────────

  const mintNFT = useCallback(async (toAddress, uri) => {
    if (!signer) throw new Error('Carteira não conectada.')
    const nftContract = getWriteContract(NFT_ABI, ADDRESSES.NFT)
    const tx = await nftContract.safeMint(toAddress, uri)
    await tx.wait()
    await fetchNftTokenIds()
    return tx.hash
  }, [signer, getWriteContract, fetchNftTokenIds])

  const stakeTokens = useCallback(async (amount) => {
    if (!signer) throw new Error('Carteira não conectada.')
    const tokenContract  = getWriteContract(TOKEN_ABI, ADDRESSES.TOKEN)
    const stakingContract = getWriteContract(STAKING_ABI, ADDRESSES.STAKING)

    // Parse amount to wei (18 decimals)
    const amountWei = parseUnits(amount.toString(), 18)

    // Step 1: approve
    const approveTx = await tokenContract.approve(ADDRESSES.STAKING, amountWei)
    await approveTx.wait()

    // Step 2: stake
    const stakeTx = await stakingContract.stake(amountWei)
    await stakeTx.wait()

    await fetchUserData()
    await fetchGlobalStats()
    return stakeTx.hash
  }, [signer, getWriteContract, fetchUserData, fetchGlobalStats])

  const unstakeTokens = useCallback(async () => {
    if (!signer) throw new Error('Carteira não conectada.')
    const stakingContract = getWriteContract(STAKING_ABI, ADDRESSES.STAKING)
    const tx = await stakingContract.unstake()
    await tx.wait()
    await fetchUserData()
    await fetchGlobalStats()
    return tx.hash
  }, [signer, getWriteContract, fetchUserData, fetchGlobalStats])

  const createProposal = useCallback(async (description) => {
    if (!signer) throw new Error('Carteira não conectada.')
    const govContract = getWriteContract(GOVERNANCE_ABI, ADDRESSES.GOVERNANCE)
    const tx = await govContract.createProposal(description)
    await tx.wait()
    await fetchProposals()
    return tx.hash
  }, [signer, getWriteContract, fetchProposals])

  const castVote = useCallback(async (proposalId, support) => {
    if (!signer) throw new Error('Carteira não conectada.')
    const govContract = getWriteContract(GOVERNANCE_ABI, ADDRESSES.GOVERNANCE)
    const tx = await govContract.vote(proposalId, support)
    await tx.wait()
    await fetchProposals()
    return tx.hash
  }, [signer, getWriteContract, fetchProposals])

  const executeProposal = useCallback(async (proposalId) => {
    if (!signer) throw new Error('Carteira não conectada.')
    const govContract = getWriteContract(GOVERNANCE_ABI, ADDRESSES.GOVERNANCE)
    const tx = await govContract.executeProposal(proposalId)
    await tx.wait()
    await fetchProposals()
    return tx.hash
  }, [signer, getWriteContract, fetchProposals])

  // ─── AUTO-REFRESH ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!provider) return
    setLoading(true)
    Promise.all([fetchGlobalStats(), fetchProposals()])
      .finally(() => setLoading(false))
  }, [provider, fetchGlobalStats, fetchProposals])

  useEffect(() => {
    if (!provider || !address) return
    fetchUserData()
    fetchNftTokenIds()
  }, [provider, address, fetchUserData, fetchNftTokenIds])

  // Refresh every 30s
  useEffect(() => {
    if (!provider) return
    const interval = setInterval(() => {
      fetchGlobalStats()
      if (address) fetchUserData()
    }, 30000)
    return () => clearInterval(interval)
  }, [provider, address, fetchGlobalStats, fetchUserData])

  return {
    agroBalance,
    totalStaked,
    ethUsdPrice,
    proposalCount,
    userStake,
    userReward,
    proposals,
    nftBalance,
    nftTokenIds,
    loading,
    fetchProposals,
    fetchUserData,
    fetchNftTokenIds,
    fetchGlobalStats,
    mintNFT,
    stakeTokens,
    unstakeTokens,
    createProposal,
    castVote,
    executeProposal,
  }
}
