import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-10">
      <div className="relative h-14 w-14">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-300"
        />
        <div className="absolute inset-2 rounded-full border border-white/10" />
      </div>
      <p className="mt-5 font-bold text-white">Analyzing image</p>
      <p className="mt-1 text-sm text-slate-400">Running model inference...</p>
    </div>
  )
}
