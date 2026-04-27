import React from 'react'
import { GovernancePanel } from '../components/GovernancePanel'

export function Governance({ contracts, wallet }) {
  return (
    <GovernancePanel contracts={contracts} wallet={wallet} />
  )
}
