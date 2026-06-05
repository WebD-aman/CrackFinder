import { motion } from 'framer-motion'
import { FiAlertTriangle, FiCheckCircle, FiPercent } from 'react-icons/fi'

export default function PredictionCard({ result, imagePreview }) {
  const isCrack = result.prediction === 'Crack Detected'
  const confidence = Number(result.confidence) || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="panel overflow-hidden rounded-lg"
    >
      <div className={`border-b px-6 py-5 ${isCrack ? 'border-red-400/20 bg-red-950/25' : 'border-emerald-400/20 bg-emerald-950/25'}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${isCrack ? 'bg-red-400/10 text-red-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
            {isCrack ? <FiAlertTriangle className="text-xl" /> : <FiCheckCircle className="text-xl" />}
          </div>
          <div>
            <h3 className={`text-xl font-black ${isCrack ? 'text-red-100' : 'text-emerald-100'}`}>{result.prediction}</h3>
            <p className="text-sm text-slate-400">{isCrack ? 'Visible crack pattern found.' : 'No visible crack pattern found.'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[0.95fr_1.05fr]">
        {imagePreview && (
          <div className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-slate-900">
            <img src={imagePreview} alt="Analyzed pavement" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-col justify-center gap-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <FiPercent className="text-teal-300" /> Confidence
              </span>
              <span className="font-mono text-3xl font-black text-white">{confidence}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(confidence, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                className={`h-full rounded-full ${isCrack ? 'bg-red-400' : 'bg-emerald-400'}`}
              />
            </div>
          </div>

          <div className={`w-fit rounded-lg border px-3 py-2 text-sm font-bold ${isCrack ? 'border-red-400/25 bg-red-400/10 text-red-200' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'}`}>
            {isCrack ? 'Inspection recommended' : 'Surface appears clear'}
          </div>

          <p className="text-sm leading-7 text-slate-400">
            {isCrack
              ? 'Review this location and schedule maintenance if the image represents an active road surface.'
              : 'Continue routine monitoring and re-scan if lighting, angle, or image quality changes.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
