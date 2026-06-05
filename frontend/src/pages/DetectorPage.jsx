import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiAlertCircle, FiZap } from 'react-icons/fi'

import Loader from '../components/Loader'
import PredictionCard from '../components/PredictionCard'
import UploadBox from '../components/UploadBox'
import { detectCrack } from '../services/api'

export default function DetectorPage({ onNewResult }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await detectCrack(selectedFile)
      setResult(data)
      onNewResult({ ...data, filename: selectedFile.name, preview: imagePreview })
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Prediction failed. Check your connection.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [imagePreview, onNewResult, selectedFile])

  return (
    <section id="detector" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel rounded-lg p-6 sm:p-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Analysis Tool</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Upload Surface Image</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Use a clear pavement or road photo for best results. The image stays in this session and is sent only to your local prediction API.
          </p>

          <div className="mt-8 space-y-5">
            <UploadBox onFileSelect={handleFileSelect} selectedFile={selectedFile} onClear={handleClear} />

            {selectedFile && !loading && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3.5 text-base font-black text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300 active:scale-[0.99]"
              >
                <FiZap /> Analyze Image
              </motion.button>
            )}

            <AnimatePresence>{loading && <Loader />}</AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-950/35 p-4 text-sm text-red-200"
                >
                  <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {result ? (
            <PredictionCard key="result" result={result} imagePreview={imagePreview} />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="panel flex min-h-[420px] items-center justify-center rounded-lg p-6"
            >
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-5 h-20 w-20 rounded-lg border border-white/10 bg-white/[0.03]" />
                <h3 className="text-xl font-black text-white">Result preview</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your analyzed image, classification, and confidence score will appear here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
