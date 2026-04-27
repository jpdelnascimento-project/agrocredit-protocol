import React from 'react'
import { NFTPanel } from '../components/NFTPanel'

export function NFT({ contracts, wallet }) {
  return (
    <NFTPanel contracts={contracts} wallet={wallet} />
  )
}
