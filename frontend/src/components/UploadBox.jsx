import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiFile, FiImage, FiUploadCloud, FiX } from 'react-icons/fi'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
const MAX_SIZE_MB = 10

export default function UploadBox({ onFileSelect, selectedFile, onClear }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validateFile = useCallback((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported format. Upload JPG, PNG, WEBP, or BMP.')
      return false
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return false
    }

    setError(null)
    return true
  }, [])

  const handleFile = useCallback((file) => {
    if (validateFile(file)) onFileSelect(file)
  }, [onFileSelect, validateFile])

  const onDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (event) => {
    const file = event.target.files[0]
    if (file) handleFile(file)
  }

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300">
            <FiImage className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white">{selectedFile.name}</p>
            <p className="text-sm text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB ready for analysis</p>
          </div>
          <button
            onClick={onClear}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Remove selected file"
          >
            <FiX />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        animate={{ borderColor: isDragging ? 'rgba(45,212,191,0.7)' : 'rgba(255,255,255,0.12)' }}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 text-center transition ${
          isDragging ? 'bg-teal-400/10' : 'bg-white/[0.02] hover:bg-white/[0.045]'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-400/10 text-teal-300">
          <FiUploadCloud className="text-3xl" />
        </div>
        <div>
          <p className="text-lg font-black text-white">{isDragging ? 'Drop image to upload' : 'Drop pavement image here'}</p>
          <p className="mt-1 text-sm text-slate-400">or select a file from your device</p>
          <p className="mt-3 text-xs font-medium text-slate-500">JPG, PNG, WEBP, BMP. Max {MAX_SIZE_MB}MB.</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={onInputChange}
          className="hidden"
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-red-300"
          >
            <FiFile className="flex-shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
