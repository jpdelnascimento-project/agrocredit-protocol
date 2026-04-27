import React from 'react'
import { Dashboard } from '../components/Dashboard'

export function Home({ contracts, wallet }) {
  return (
    <Dashboard
      contracts={contracts}
      isConnected={wallet.isConnected}
    />
  )
}
