import React from 'react'
import { StakingPanel } from '../components/StakingPanel'

export function Staking({ contracts, wallet }) {
  return (
    <StakingPanel contracts={contracts} wallet={wallet} />
  )
}
