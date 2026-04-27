import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Navbar }  from './components/Navbar'
import { Home }       from './pages/Home'
import { NFT }        from './pages/NFT'
import { Staking }    from './pages/Staking'
import { Governance } from './pages/Governance'
import { useWallet }    from './hooks/useWallet'
import { useContracts } from './hooks/useContracts'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const wallet    = useWallet()
  const contracts = useContracts(wallet.provider, wallet.signer, wallet.address)

  const pageProps = { contracts, wallet }

  return (
    <div className="min-h-screen bg-agro-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main layout: offset by sidebar width on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          wallet={wallet}
          agroBalance={contracts.agroBalance}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 pt-16 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/"           element={<Home       {...pageProps} />} />
            <Route path="/nft"        element={<NFT        {...pageProps} />} />
            <Route path="/staking"    element={<Staking    {...pageProps} />} />
            <Route path="/governance" element={<Governance {...pageProps} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 py-4 px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/20 text-xs">
              AgroCredit Protocol — MVP Acadêmico · Sepolia Testnet
            </p>
            <p className="text-white/20 text-xs">
              React 18 + Vite + ethers.js v6 + Tailwind CSS
            </p>
          </div>
        </footer>
      </div>

      {/* Wallet error global banner */}
      {wallet.error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-950/95 border border-red-700/50 shadow-glass">
            <span className="text-red-400 text-sm flex-1">{wallet.error}</span>
            <button
              onClick={() => wallet.setError(null)}
              className="text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
