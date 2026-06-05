import { useCallback, useState } from 'react'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DetectorPage from './pages/DetectorPage'
import PredictionHistory from './components/PredictionHistory'

export default function App() {
  const [history, setHistory] = useState([])
  const [totalScans, setTotalScans] = useState(0)

  const handleNewResult = useCallback((result) => {
    const entry = {
      ...result,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setHistory((prev) => [entry, ...prev].slice(0, 20))
    setTotalScans((count) => count + 1)
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar totalScans={totalScans} />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]" />
        <Hero />
        <DetectorPage onNewResult={handleNewResult} />
        <PredictionHistory history={history} onClear={handleClearHistory} />
      </main>
    </div>
  )
}
