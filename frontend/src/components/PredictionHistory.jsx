import { AnimatePresence, motion } from 'framer-motion'
import { FiAlertTriangle, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi'

export default function PredictionHistory({ history, onClear }) {
  if (history.length === 0) return null

  return (
    <section id="history" className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
              <FiClock /> Session History
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Recent scans</h2>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:border-red-400/40 hover:text-red-300"
          >
            <FiTrash2 /> Clear
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {history.map((item, index) => {
              const isCrack = item.prediction === 'Crack Detected'

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ delay: index * 0.025 }}
                  className="panel flex items-center gap-4 rounded-lg p-4"
                >
                  {item.preview && (
                    <img
                      src={item.preview}
                      alt=""
                      className="h-14 w-14 flex-shrink-0 rounded-md border border-white/10 object-cover"
                    />
                  )}

                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isCrack ? 'bg-red-400/10 text-red-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
                    {isCrack ? <FiAlertTriangle /> : <FiCheckCircle />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`font-bold ${isCrack ? 'text-red-200' : 'text-emerald-200'}`}>{item.prediction}</p>
                    <p className="truncate text-sm text-slate-500">{item.filename}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-lg font-black text-white">{item.confidence}%</p>
                    <p className="text-xs text-slate-500">{item.timestamp}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
