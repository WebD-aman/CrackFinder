import { motion } from 'framer-motion'
import { TbRoad } from 'react-icons/tb'

export default function Navbar({ totalScans = 0 }) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 right-0 top-0 z-50"
    >
      <div className="border-b border-white/10 bg-slate-950/82 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20">
                <TbRoad className="text-xl" />
              </div>
              <span className="font-display text-lg font-black tracking-tight">CrackFinder</span>
            </div>

            <div className="hidden items-center gap-7 text-sm font-medium text-slate-400 sm:flex">
              <a href="#detector" className="transition-colors hover:text-teal-300">Detector</a>
              <a href="#history" className="transition-colors hover:text-teal-300">History</a>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300">
              {totalScans} scan{totalScans === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
