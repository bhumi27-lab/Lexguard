import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Shield,
  Scale,
  Gavel,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
  UploadCloud,
  Cpu,
  Eye,
} from 'lucide-react'
import type { AnalysisResult } from '../types'

const BACKEND_URL = 'http://localhost:8000'

const LOADING_STEPS = [
  { label: 'Parsing contract documents...', icon: '⚖️' },
  { label: 'Defender reviewing clauses...', icon: '🛡️' },
  { label: 'Prosecutor building case...', icon: '🏢' },
  { label: 'Judge deliberating verdicts...', icon: '👨‍⚖️' },
  { label: 'Simulating future consequences...', icon: '🕒' },
]

/* ── ⚖️ PART 1: Animated Legal Background Component ── */

interface ShapeInstance {
  id: string
  type: 'scales' | 'gavel' | 'scroll' | 'quill' | 'padlock' | 'shield'
  size: number
  rotation: number
  coords: {
    left?: string
    right?: string
    top?: string
    bottom?: string
  }
  animation: {
    yDisplacement: number
    duration: number
    delay: number
  }
}

const BACKGROUND_SHAPES: ShapeInstance[] = [
  // 1. Scales of Justice (3 instances)
  {
    id: 'scales-1',
    type: 'scales',
    size: 120,
    rotation: -15,
    coords: { left: '5%', top: '12%' },
    animation: { yDisplacement: 22, duration: 9, delay: 0 },
  },
  {
    id: 'scales-2',
    type: 'scales',
    size: 80,
    rotation: 12,
    coords: { right: '6%', bottom: '15%' },
    animation: { yDisplacement: -18, duration: 12, delay: 2 },
  },
  {
    id: 'scales-3',
    type: 'scales',
    size: 60,
    rotation: -8,
    coords: { left: '4%', top: '48%' },
    animation: { yDisplacement: 15, duration: 7, delay: 4 },
  },

  // 2. Gavel (2 instances)
  {
    id: 'gavel-1',
    type: 'gavel',
    size: 100,
    rotation: 25,
    coords: { right: '8%', top: '16%' },
    animation: { yDisplacement: -25, duration: 11, delay: 1 },
  },
  {
    id: 'gavel-2',
    type: 'gavel',
    size: 70,
    rotation: -20,
    coords: { left: '6%', bottom: '14%' },
    animation: { yDisplacement: 20, duration: 8, delay: 3 },
  },

  // 3. Legal Document / Scroll (4 instances)
  {
    id: 'scroll-1',
    type: 'scroll',
    size: 90,
    rotation: -5,
    coords: { left: '20%', top: '8%' },
    animation: { yDisplacement: -16, duration: 10, delay: 0.5 },
  },
  {
    id: 'scroll-2',
    type: 'scroll',
    size: 70,
    rotation: 15,
    coords: { right: '18%', bottom: '8%' },
    animation: { yDisplacement: 18, duration: 13, delay: 1.5 },
  },
  {
    id: 'scroll-3',
    type: 'scroll',
    size: 50,
    rotation: -18,
    coords: { right: '4%', top: '55%' },
    animation: { yDisplacement: -12, duration: 6.5, delay: 2.5 },
  },
  {
    id: 'scroll-4',
    type: 'scroll',
    size: 40,
    rotation: 10,
    coords: { right: '3%', top: '32%' },
    animation: { yDisplacement: 14, duration: 8.5, delay: 3.5 },
  },

  // 4. Quill Pen (2 instances)
  {
    id: 'quill-1',
    type: 'quill',
    size: 110,
    rotation: -30,
    coords: { right: '25%', top: '5%' },
    animation: { yDisplacement: -22, duration: 14, delay: 0 },
  },
  {
    id: 'quill-2',
    type: 'quill',
    size: 75,
    rotation: 18,
    coords: { left: '18%', bottom: '5%' },
    animation: { yDisplacement: 16, duration: 9.5, delay: 2.2 },
  },

  // 5. Padlock (3 instances)
  {
    id: 'padlock-1',
    type: 'padlock',
    size: 70,
    coords: { right: '12%', top: '40%' },
    rotation: 15,
    animation: { yDisplacement: -20, duration: 11.5, delay: 1 },
  },
  {
    id: 'padlock-2',
    type: 'padlock',
    size: 50,
    coords: { left: '8%', top: '70%' },
    rotation: -10,
    animation: { yDisplacement: 15, duration: 8, delay: 3.8 },
  },
  {
    id: 'lock-3',
    type: 'padlock',
    size: 35,
    coords: { left: '26%', bottom: '12%' },
    rotation: 5,
    animation: { yDisplacement: 12, duration: 7.2, delay: 0.5 },
  },

  // 6. Shield (2 instances)
  {
    id: 'shield-1',
    type: 'shield',
    size: 85,
    rotation: -12,
    coords: { left: '32%', top: '5%' },
    animation: { yDisplacement: -18, duration: 10.5, delay: 1.2 },
  },
  {
    id: 'shield-2',
    type: 'shield',
    size: 55,
    rotation: 8,
    coords: { right: '28%', bottom: '10%' },
    animation: { yDisplacement: 14, duration: 8, delay: 3 },
  },
]

function LegalBackground() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const activeShapes = isMobile
    ? BACKGROUND_SHAPES.slice(0, Math.ceil(BACKGROUND_SHAPES.length / 2))
    : BACKGROUND_SHAPES

  const renderShapeContent = (type: string) => {
    switch (type) {
      case 'scales':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <line x1="50" y1="10" x2="50" y2="90" />
            <line x1="30" y1="90" x2="70" y2="90" />
            <line x1="15" y1="25" x2="85" y2="25" />
            <line x1="15" y1="25" x2="8" y2="55" />
            <line x1="15" y1="25" x2="22" y2="55" />
            <path d="M 8,55 C 8,63 22,63 22,55" />
            <line x1="85" y1="25" x2="78" y2="55" />
            <line x1="85" y1="25" x2="92" y2="55" />
            <path d="M 78,55 C 78,63 92,63 92,55" />
          </svg>
        )
      case 'gavel':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M 35,30 L 65,30 L 65,50 L 35,50 Z" />
            <line x1="35" y1="35" x2="65" y2="35" />
            <line x1="35" y1="45" x2="65" y2="45" />
            <line x1="50" y1="50" x2="15" y2="85" />
            <line x1="25" y1="90" x2="75" y2="90" />
            <path d="M 30,90 L 30,95 L 70,95 L 70,90" />
          </svg>
        )
      case 'scroll':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M 25,15 L 75,15 A 5,5 0 0,1 80,20 L 80,75 C 80,85 70,85 65,80 C 60,75 50,75 45,80 C 40,85 30,85 25,75 Z" />
            <line x1="35" y1="30" x2="65" y2="30" />
            <line x1="35" y1="40" x2="65" y2="40" />
            <line x1="35" y1="50" x2="65" y2="50" />
            <line x1="35" y1="60" x2="55" y2="60" />
          </svg>
        )
      case 'quill':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <line x1="80" y1="15" x2="20" y2="85" />
            <path d="M 80,15 C 70,25 45,55 25,80 C 45,75 75,50 80,15 Z" />
            <path d="M 25,80 L 15,90 L 22,83" />
            <line x1="68" y1="27" x2="58" y2="35" />
            <line x1="58" y1="37" x2="48" y2="45" />
            <line x1="48" y1="47" x2="38" y2="55" />
          </svg>
        )
      case 'padlock':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <rect x="25" y="45" width="50" height="40" rx="5" />
            <path d="M 35,45 L 35,28 A 15,15 0 0,1 65,28 L 65,45" />
            <circle cx="50" cy="60" r="5" />
            <path d="M 48,65 L 52,65 L 53,73 L 47,73 Z" />
          </svg>
        )
      case 'shield':
        return (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M 20,15 L 80,15 L 80,45 C 80,70 50,88 50,90 C 50,88 20,70 20,45 Z" />
            <path d="M 26,21 L 74,21 L 74,45 C 74,66 50,81 50,83 C 50,81 26,66 26,45 Z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 w-screen h-screen overflow-hidden z-0 select-none">
      {activeShapes.map((shape) => {
        const { id, type, size, rotation, coords, animation } = shape

        return (
          <motion.div
            key={id}
            initial={{
              y: 0,
              rotate: rotation,
              opacity: 0,
            }}
            animate={{
              y: [0, animation.yDisplacement, 0],
              opacity: [0.05, 0.08, 0.05],
            }}
            transition={{
              y: {
                duration: animation.duration,
                delay: animation.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              },
              opacity: {
                duration: animation.duration * 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              },
            }}
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              pointerEvents: 'none',
              transformOrigin: 'center center',
              ...coords,
            }}
          >
            {renderShapeContent(type)}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Main Home Component ── */

export default function Home() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  /* ── Vanta.js via CDN script tags (ES module import does NOT work with Vanta) ── */
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    // Helper: load a script tag and resolve when done
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        // Don't add the same script twice
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(s)
      })

    const initVanta = async () => {
      try {
        // 1. Load THREE first — Vanta depends on it being on window
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
        // 2. Then load Vanta dots
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js')

        // 3. Init only once
        if (vantaRef.current && !(window as any).VANTA === false && !vantaEffect.current) {
          vantaEffect.current = (window as any).VANTA.DOTS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xc9a84c,
            color2: 0xb8860b,
            backgroundColor: 0x0a0a0a,
            size: 7.5,
            spacing: 150,
            showLines: false,
          })
        }
      } catch (e) {
        console.warn('Vanta failed to load:', e)
      }
    }

    initVanta()

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  useEffect(() => {
    let interval: any
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [isLoading])

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
  }, [])

  const triggerAnalysis = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setLoadingStep(0)

    try {
      const form = new FormData()
      form.append('file', selectedFile)

      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        let msg = 'Analysis failed. Please try again.'
        try {
          msg = (await res.json()).detail ?? msg
        } catch {
          /* noop */
        }
        throw new Error(msg)
      }

      const data: AnalysisResult = await res.json()
      navigate('/analysis', { state: { data } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach analysis server.')
      setIsLoading(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleUpload(f)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleUpload(f)
  }

  return (
    <div
      ref={vantaRef}
      className="min-h-screen bg-[#0A0A0A] relative overflow-x-hidden font-sans text-[#F5F0E8] select-none"
      style={{ minHeight: '100vh', width: '100%' }}
    >
      {/* All content needs z-index above Vanta canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* PART 1 — ANIMATED LEGAL BACKGROUND */}
        <LegalBackground />

        {/* Background Aesthetics */}
        <div className="pointer-events-none fixed inset-0 bg-grid-faint opacity-40 z-0" />

        {/* ── PART 2 — HERO SECTION ── */}
        <div className="relative min-h-screen flex flex-col justify-between z-10 w-full max-w-7xl mx-auto px-6">

          {/* Nav Header Row */}
          <header className="w-full flex items-center justify-between py-6 border-b border-[#C9A84C]/15 backdrop-blur-md bg-[#0A0A0A]/40 relative z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#111111] border border-[#C9A84C]/35 flex items-center justify-center shadow-gold-soft">
                <Gavel className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <span className="font-cinzel text-xl font-bold tracking-wider">
                <span className="text-[#F5F0E8]">Lex</span>
                <span className="text-[#C9A84C]">Guard</span>
              </span>
            </div>
            <span className="text-[10px] text-[#F5F0E8] font-mono tracking-widest uppercase border border-[#C9A84C]/25 rounded-full px-4 py-1.5 bg-[#111111]">
              AI Contract Courtroom
            </span>
          </header>

          {/* Central Hero Body */}
          <div className="flex-1 flex flex-col items-center justify-center py-20 relative">

            {/* Subtle slow pulsing radial gradient behind hero */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1.2, 0.8] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(201,168,76,0.05)_0%,transparent_60%)] z-0"
            />

            <div className="relative z-10 text-center w-full">

              {/* Logo Row */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex flex-col items-center mb-6"
              >
                <span className="font-cinzel text-5xl md:text-6xl font-black tracking-widest">
                  <span className="text-[#F5F0E8]">LEX</span>
                  <span className="text-[#C9A84C] text-glow-gold">GUARD</span>
                </span>
                {/* Thin gold horizontal divider line below logo */}
                <div className="w-32 h-[1px] bg-[#C9A84C] mt-4" />
              </motion.div>

              {/* Tagline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-4xl md:text-5xl font-serif italic text-[#F5F0E8] tracking-tight mb-6"
              >
                Sign informed. Not blind.
              </motion.h1>

              {/* Sub-tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="text-lg md:text-xl text-[#F5F0E8] max-w-2xl mx-auto leading-relaxed mb-10 font-sans"
              >
                Three AI agents debate every risky clause in your contract — then simulate the consequences month by month.
              </motion.p>

              {/* Three stat badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 flex-wrap mb-14"
              >
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111111] border border-[#C9A84C] text-[#C9A84C] text-sm font-semibold tracking-wider font-cinzel">
                  <Shield className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-[#F5F0E8]">3 AI AGENTS</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111111] border border-[#C9A84C] text-[#C9A84C] text-sm font-semibold tracking-wider font-cinzel">
                  <Scale className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-[#F5F0E8]">8 CLAUSE TYPES</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111111] border border-[#C9A84C] text-[#C9A84C] text-sm font-semibold tracking-wider font-cinzel">
                  <Clock className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-[#F5F0E8]">2YR SIMULATION</span>
                </div>
              </motion.div>

              {/* ── PART 3 — UPLOAD SECTION ── */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-full max-w-[600px] mx-auto z-10"
              >
                <div className="bg-[#111111] border border-[#1A1A1A] hover:border-[#C9A84C]/50 rounded-2xl p-8 shadow-gold-soft transition-all duration-300 relative group">
                  {/* Corner details */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C9A84C]/30" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C9A84C]/30" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C9A84C]/30" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C9A84C]/30" />

                  <div
                    className={`p-10 flex flex-col items-center gap-5 cursor-pointer rounded-xl transition-all duration-300 ${isDragging
                      ? 'border-2 border-[#C9A84C] bg-[#C9A84C]/5 shadow-[inset_0_0_20px_rgba(201,168,76,0.1)]'
                      : 'border-2 border-dashed border-[#C9A84C]/25 bg-[#0A0A0A]/40'
                      }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border border-[#C9A84C]/30 flex items-center justify-center shadow-gold-soft group-hover:border-[#C9A84C] transition-colors">
                      <Upload className="w-8 h-8 text-[#C9A84C]" />
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-serif text-[#F5F0E8] font-bold mb-2">
                        {isDragging ? 'Relinquish contract here' : 'Upload your contract'}
                      </p>
                      <p className="text-base text-[#F5F0E8] leading-relaxed max-w-sm mx-auto">
                        PDF up to 20MB — Employment, Freelance, SaaS, Rental, Privacy Policy
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

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-start gap-3 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-xl px-4 py-3 text-red-400 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-[#F5F0E8]">{error}</span>
                    </motion.div>
                  )}

                  {selectedFile && !error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 p-5 rounded-xl bg-[#0A0A0A]/60 border border-[#C9A84C]/35 flex flex-col gap-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0" />
                          <span className="text-[#F5F0E8] text-sm font-mono truncate">
                            {selectedFile.name}
                          </span>
                        </div>
                        <span className="text-[#34D399] text-xs font-bold tracking-widest uppercase bg-[#2C4A2E]/20 px-3 py-1 rounded border border-[#2C4A2E]/50">
                          Ready to analyze
                        </span>
                      </div>

                      <button
                        onClick={triggerAnalysis}
                        className="w-full bg-[#C9A84C] hover:bg-[#D9B85C] text-[#0A0A0A] text-lg font-cinzel font-bold tracking-widest py-4 rounded-lg transition-all duration-300 shadow-[0_0_25px_rgba(201,168,76,0.3)] uppercase hover:scale-[1.01]"
                      >
                        Analyze Contract
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

            </div>
          </div>

          <div className="h-6" />
        </div>

        {/* ── PART 4 — FEATURE CARDS (BIGGER) ── */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-[#C9A84C]/15 bg-transparent">

          <div className="text-center mb-16">
            <span className="text-xs text-[#C9A84C] font-mono tracking-widest uppercase border border-[#C9A84C]/25 rounded-full px-4.5 py-1.5 bg-[#111111] mb-4 inline-block">
              Core Chambers
            </span>
            <h2 className="font-serif italic text-4xl text-[#F5F0E8] font-bold">
              The Interactive Courtroom Infrastructure
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {/* Card 1: The Defender */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -6 }}
              className="bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#8B0000] rounded-xl p-8 min-h-[240px] flex flex-col gap-4.5 shadow-md hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-300 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#8B0000]/20" />
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#8B0000]/25 flex items-center justify-center shadow-md">
                <Shield className="w-8 h-8 text-[#8B0000]" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-[#8B0000] font-bold mb-2">
                  The Defender
                </h3>
                <p className="text-base text-[#F5F0E8] leading-relaxed mb-1.5 font-medium">
                  Finds every clause designed to restrict or harm you
                </p>
                <p className="text-base text-[#F5F0E8] leading-relaxed opacity-75">
                  Non-compete, IP transfer, termination traps and hidden liabilities
                </p>
              </div>
            </motion.div>

            {/* Card 2: The Prosecutor */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -6 }}
              className="bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#1B3A5C] rounded-xl p-8 min-h-[240px] flex flex-col gap-4.5 shadow-md hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-300 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#1B3A5C]/20" />
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#1B3A5C]/25 flex items-center justify-center shadow-md">
                <Briefcase className="w-8 h-8 text-[#1B3A5C]" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-[#1B3A5C] font-bold mb-2">
                  The Prosecutor
                </h3>
                <p className="text-base text-[#F5F0E8] leading-relaxed mb-1.5 font-medium">
                  Reveals the corporate strategy behind each term
                </p>
                <p className="text-base text-[#F5F0E8] leading-relaxed opacity-75">
                  Understand why every clause was written and what it protects
                </p>
              </div>
            </motion.div>

            {/* Card 3: Judge AI */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -6 }}
              className="bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#C9A84C] rounded-xl p-8 min-h-[240px] flex flex-col gap-4.5 shadow-md hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-300 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C9A84C]/20" />
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center shadow-md">
                <Scale className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-[#C9A84C] font-bold mb-2">
                  Judge AI
                </h3>
                <p className="text-base text-[#F5F0E8] leading-relaxed mb-1.5 font-medium">
                  Delivers neutral verdicts with negotiation tactics
                </p>
                <p className="text-base text-[#F5F0E8] leading-relaxed opacity-75">
                  Get exact counter-clauses to send back before you sign
                </p>
              </div>
            </motion.div>

            {/* Card 4: Time Machine */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ y: -6 }}
              className="bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#C9A84C] rounded-xl p-8 min-h-[240px] flex flex-col gap-4.5 shadow-md hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-300 relative"
            >
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C9A84C]/20" />
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center shadow-md">
                <Clock className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-[#C9A84C] font-bold mb-2">
                  Time Machine
                </h3>
                <p className="text-base text-[#F5F0E8] leading-relaxed mb-1.5 font-medium">
                  Simulates your life 2 years after signing this contract
                </p>
                <p className="text-base text-[#F5F0E8] leading-relaxed opacity-75">
                  Month-by-month consequence timeline across best, realistic and worst cases
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── PART 5 — HOW IT WORKS SECTION ── */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-[#C9A84C]/15 bg-transparent">

          <div className="text-center mb-20">
            <h2 className="font-serif italic text-4xl text-[#C9A84C] font-bold mb-2">
              How LexGuard Works
            </h2>
            <div className="w-20 h-[1px] bg-[#C9A84C]/35 mx-auto mt-4" />
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="flex flex-col md:flex-row items-stretch justify-between gap-6 relative"
          >
            {/* Step 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex-1 bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#C9A84C] rounded-xl p-8 relative flex flex-col gap-4"
            >
              <span className="font-serif text-6xl text-[#C9A84C]/30 font-bold block select-none">
                01
              </span>
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-2xl font-serif text-[#F5F0E8] font-bold">
                Upload Your Contract
              </h3>
              <p className="text-base text-[#F5F0E8] leading-relaxed opacity-90">
                Drop any PDF contract — employment agreements, freelance terms, SaaS subscriptions, rental agreements, or privacy policies.
              </p>
            </motion.div>

            {/* Connection Arrow 1 */}
            <div className="hidden md:flex items-center justify-center shrink-0 self-center">
              <span className="text-3xl text-[#C9A84C] font-bold select-none px-2 animate-pulse">→</span>
            </div>

            {/* Step 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex-1 bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#C9A84C] rounded-xl p-8 relative flex flex-col gap-4"
            >
              <span className="font-serif text-6xl text-[#C9A84C]/30 font-bold block select-none">
                02
              </span>
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-2xl font-serif text-[#F5F0E8] font-bold">
                AI Agents Debate Every Clause
              </h3>
              <p className="text-base text-[#F5F0E8] leading-relaxed opacity-90">
                Three specialized AI agents — The Defender, The Prosecutor, and Judge AI — analyze each risky clause from opposing legal perspectives.
              </p>
            </motion.div>

            {/* Connection Arrow 2 */}
            <div className="hidden md:flex items-center justify-center shrink-0 self-center">
              <span className="text-3xl text-[#C9A84C] font-bold select-none px-2 animate-pulse">→</span>
            </div>

            {/* Step 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex-1 bg-[#111111] border border-[#1A1A1A] border-t-4 border-t-[#C9A84C] rounded-xl p-8 relative flex flex-col gap-4"
            >
              <span className="font-serif text-6xl text-[#C9A84C]/30 font-bold block select-none">
                03
              </span>
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center">
                <Eye className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-2xl font-serif text-[#F5F0E8] font-bold">
                See Your Future Before Signing
              </h3>
              <p className="text-base text-[#F5F0E8] leading-relaxed opacity-90">
                The Contract Time Machine simulates month-by-month consequences for 2 years so you know exactly what you are agreeing to.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── PART 7: FOOTER ── */}
        <footer className="relative z-10 w-full border-t border-[#C9A84C]/25 bg-[#111111]/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#111111] border border-[#C9A84C]/35 flex items-center justify-center shadow-gold-soft">
                <Gavel className="w-3.5 h-3.5 text-[#C9A84C]" />
              </div>
              <span className="font-cinzel text-lg font-bold tracking-wider text-[#C9A84C]">
                LexGuard
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm text-[#F5F0E8] font-sans font-medium tracking-wide">
                Built for PromptWars 2026 — Google × Scaler School of Technology
              </p>
            </div>

            <div className="md:text-right">
              <span className="font-serif italic text-base text-[#C9A84C] font-semibold tracking-wide">
                Sign informed. Not blind.
              </span>
            </div>
          </div>
        </footer>

        {/* ── PART 6 — LOADING STATE ── */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0A0A0A]/97 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none"
            >
              {/* Gold particle animation backdrop */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
                <div className="absolute top-[10%] left-[20%] w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-ping" />
                <div className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
                <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-ping" />
                <div className="absolute bottom-[10%] right-[25%] w-2.5 h-2.5 bg-[#C9A84C] rounded-full animate-pulse" />
              </div>

              {/* Core Scale representation block */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border border-[#C9A84C]/25 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-2 rounded-full border border-dashed border-[#C9A84C]/15 animate-spin" style={{ animationDuration: '6s' }} />

                <svg
                  className="w-16 h-16 text-[#C9A84C] drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v17" />
                  <path d="M12 5l7 2" />
                  <path d="M12 5l-7 2" />
                  <path d="M19 7v5" />
                  <path d="M5 7v5" />
                  <path d="M19 12a3 3 0 0 1-6 0c0-1.66 1.34-3 3-3s3 1.34 3 3z" />
                  <path d="M5 12a3 3 0 0 1-6 0c0-1.66 1.34-3 3-3s3 1.34 3 3z" />
                  <path d="M4 20h16" />
                </svg>
              </div>

              <div className="text-center mb-10 max-w-lg">
                <h2 className="font-serif italic text-3xl text-[#C9A84C] mb-2 tracking-tight">
                  The AI Courtroom is in session...
                </h2>
                <p className="text-base text-[#F5F0E8] font-sans tracking-wide">
                  Analyzing your contract for hidden risks
                </p>
              </div>

              <div className="w-full max-w-[360px] bg-[#111111] border border-[#C9A84C]/25 rounded-xl p-6 shadow-gold-soft relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C9A84C]/35" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C9A84C]/35" />

                {LOADING_STEPS.map((step, idx) => {
                  const isPassed = idx < loadingStep
                  const isActive = idx === loadingStep

                  return (
                    <div key={idx} className="flex items-center justify-between text-base font-sans py-1.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm shrink-0">{step.icon}</span>
                        <span className={`truncate text-base ${isActive ? 'text-[#F5F0E8] font-bold' : isPassed ? 'text-[#F5F0E8]/60' : 'text-[#F5F0E8]'}`}>
                          {step.label}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 ${isPassed
                          ? 'bg-[#C9A84C] border-[#C9A84C]'
                          : isActive
                            ? 'border-[#C9A84C] loading-step-pulse'
                            : 'border-[#C9A84C]/20 bg-transparent'
                          }`}
                      >
                        {isPassed && (
                          <span className="text-[8px] text-[#0A0A0A] font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <span className="text-[10px] text-[#F5F0E8] font-mono tracking-widest mt-8 uppercase">
                This usually takes 15-30 seconds
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>{/* end z-index wrapper */}
    </div>
  )
}