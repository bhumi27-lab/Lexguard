import { useState, useCallback, useRef } from 'react'
import { useNavigate }   from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Shield, Scale, Gavel,
  AlertCircle, Loader2, Clock, CheckCircle,
} from 'lucide-react'
import type { AnalysisResult } from '../types'

const BACKEND_URL = 'http://localhost:8000'

const LOADING_STEPS = [
  { icon: FileText, label: 'Extracting contract clauses…'   },
  { icon: Shield,   label: 'Consulting the Defender…'       },
  { icon: Scale,    label: 'Briefing the Prosecutor…'       },
  { icon: Gavel,    label: 'Summoning the Judge…'           },
  { icon: Clock,    label: 'Generating future timeline…'    },
  { icon: CheckCircle, label: 'Preparing courtroom report…' },
]

const FEATURES = [
  { icon: Shield, title: 'Defender AI',    desc: 'Surfaces every clause that could harm you.'          },
  { icon: Scale,  title: 'Prosecutor AI',  desc: 'Explains the company\'s legal strategy behind each term.' },
  { icon: Gavel,  title: 'Judge AI',       desc: 'Delivers a neutral verdict with negotiation tactics.' },
  { icon: Clock,  title: 'Time Machine',   desc: 'Simulates consequences month-by-month for 2 years.'  },
]

export default function Home() {
  const navigate        = useNavigate()
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging]     = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [loadingStep, setLoadingStep]   = useState(0)
  const [error, setError]               = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. Please upload a .pdf contract document.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds 20 MB. Please upload a smaller document.')
      return
    }

    setSelectedFile(file)
    setError(null)
    setIsLoading(true)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 3500)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        let msg = 'Analysis failed. Please try again.'
        try { msg = (await res.json()).detail ?? msg } catch { /* noop */ }
        throw new Error(msg)
      }

      const data: AnalysisResult = await res.json()
      clearInterval(interval)
      navigate('/analysis', { state: { data } })
    } catch (err) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : 'Could not reach analysis server.')
      setIsLoading(false)
    }
  }, [navigate])

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleUpload(f)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleUpload(f)
  }

  const StepIcon = LOADING_STEPS[loadingStep].icon

  return (
    <div className="min-h-screen bg-[#0A0E1A] relative overflow-x-hidden">
      {/* Background grid + radial */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-faint"
        style={{ backgroundSize: '40px 40px' }}
      />
      <div className="pointer-events-none fixed inset-0 bg-hero-radial" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#1E2A45]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-accent-sm">
            <Gavel className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">LexGuard</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">AI Contract Courtroom</span>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent-light
                       rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse" />
            AI-Powered Legal Analysis
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-7xl md:text-8xl font-black tracking-tighter text-white mb-4 text-glow"
          >
            Lex<span className="text-accent">Guard</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-2xl md:text-3xl font-light text-slate-400 mb-4 tracking-tight"
          >
            Know the future <span className="text-slate-200 font-medium">before you sign.</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 text-base mb-14 max-w-xl mx-auto leading-relaxed"
          >
            Three AI agents debate every risky clause in your contract — then simulate
            the month-by-month consequences of signing it.
          </motion.p>

          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="max-w-xl mx-auto"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="glass-card p-10 flex flex-col items-center gap-6"
                >
                  {/* Animated ring */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse" />
                    <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/40 flex items-center justify-center">
                      <StepIcon className="w-6 h-6 text-accent-light" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-300 font-medium text-sm mb-1">
                      {LOADING_STEPS[loadingStep].label}
                    </p>
                    <p className="text-slate-600 text-xs font-mono">{selectedFile?.name}</p>
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-2">
                    {LOADING_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i <= loadingStep
                            ? 'bg-accent w-6'
                            : 'bg-[#1E2A45] w-2'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Skeleton rows */}
                  <div className="w-full space-y-2 pt-2">
                    {[80, 65, 90, 55].map((w, i) => (
                      <div key={i} className={`skeleton h-3`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <div
                    className={`drop-zone p-14 flex flex-col items-center gap-5 cursor-pointer
                                transition-all duration-300 ${isDragging ? 'dragging' : 'hover:border-accent/40'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isDragging
                        ? 'bg-accent/20 shadow-accent border border-accent/50'
                        : 'bg-[#0F1629] border border-[#1E2A45]'}`}
                    >
                      <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-accent-light' : 'text-slate-500'}`} />
                    </div>

                    <div className="text-center">
                      <p className="text-slate-300 font-semibold text-base mb-1">
                        {isDragging ? 'Drop your contract here' : 'Drag & drop your PDF contract'}
                      </p>
                      <p className="text-slate-600 text-sm">
                        or <span className="text-accent-light font-medium">browse files</span> · PDF up to 20 MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30
                                   rounded-xl px-4 py-3 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 px-2"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card p-5 flex flex-col gap-3 hover:border-accent/30 hover:shadow-accent-sm
                         transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center
                              group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5 text-accent-light" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-[#1E2A45]">
        <p className="text-slate-600 text-xs">
          LexGuard does not provide legal advice. Always consult a qualified attorney.
        </p>
      </footer>
    </div>
  )
}
