import { motion } from 'framer-motion'
import { FiArrowRight, FiShield, FiUploadCloud } from 'react-icons/fi'

const STATS = [
  { label: 'Model', value: 'CNN + ViT' },
  { label: 'Input', value: 'JPG, PNG, WEBP' },
  { label: 'Output', value: 'Result + confidence' },
]

export default function Hero() {
  return (
    <section className="px-4 pb-10 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:min-h-[560px] lg:grid-cols-[1.03fr_0.97fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-sm font-semibold text-teal-200">
            <FiShield /> Pavement inspection AI
          </div>
          <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Detect pavement cracks with a cleaner, faster workflow.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Upload a road surface image, run the trained model, and review the prediction with confidence in one focused workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#detector"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300"
            >
              Start Analysis <FiArrowRight />
            </a>
            <a
              href="#history"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 font-semibold text-slate-200 transition hover:border-teal-300/50 hover:text-white"
            >
              View Scans
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
          className="panel relative overflow-hidden rounded-lg p-5"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-slate-900">
            <div className="relative h-full w-full bg-[linear-gradient(135deg,#334155_0%,#111827_54%,#020617_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(90deg,transparent_0%,rgba(45,212,191,0.18)_45%,transparent_47%,rgba(248,113,113,0.2)_52%,transparent_54%)]" />
              <svg viewBox="0 0 600 450" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d="M92 310 C160 270 208 302 258 246 C302 198 352 222 404 160 C452 103 510 118 552 80" fill="none" stroke="rgba(45,212,191,0.55)" strokeWidth="3" />
                <path d="M198 346 L226 292 L244 316 L278 252 L304 284 L346 210 L362 232" fill="none" stroke="rgba(248,113,113,0.82)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M276 252 L254 226 M304 284 L328 308 M346 210 L380 190" fill="none" stroke="rgba(248,113,113,0.72)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="absolute left-4 top-4 rounded-md border border-red-400/30 bg-red-950/70 px-3 py-2 text-sm font-bold text-red-200">
                Crack Detected
              </div>
              <div className="absolute bottom-4 right-4 rounded-md border border-white/10 bg-slate-950/75 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">Confidence</div>
                <div className="font-mono text-2xl font-black text-white">94%</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STATS.map(({ label, value }) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">{label}</div>
                <div className="mt-1 text-sm font-bold text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <FiUploadCloud className="text-teal-300" />
            Ready for road, bridge, and pavement surface photos.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
