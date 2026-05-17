import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gavel,
  Shield,
  Scale,
  ArrowLeft,
  Download,
  AlertTriangle,
} from 'lucide-react'
import CourtroomPanel from '../components/CourtroomPanel'
import TimeMachine from '../components/TimeMachine'
import type { AnalysisResult, RiskLevel, Verdict } from '../types'

/* ── Helpers for Styling ── */

function bannerBgClass(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-gradient-to-r from-[#8B0000]/60 to-[#0A0A0A]'
    case 'MEDIUM':
      return 'bg-gradient-to-r from-[#8B6914]/60 to-[#0A0A0A]'
    case 'LOW':
      return 'bg-gradient-to-r from-[#2C4A2E]/60 to-[#0A0A0A]'
    default:
      return 'bg-gradient-to-r from-[#8B6914]/60 to-[#0A0A0A]'
  }
}

function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-[#8B0000]/20 text-red-400 border border-[#8B0000]/50 high-risk-pulse'
    case 'MEDIUM':
      return 'bg-[#8B6914]/20 text-amber-400 border border-[#C9A84C]/50'
    case 'LOW':
      return 'bg-[#2C4A2E]/20 text-emerald-400 border border-[#2C4A2E]/50'
    default:
      return 'bg-[#8B6914]/20 text-amber-400 border border-[#C9A84C]/50'
  }
}

function clauseLabel(type: string): string {
  if (!type) return 'Clause'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ── Main Component ── */

export default function Analysis() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data as AnalysisResult | undefined

  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true })
    }
  }, [data, navigate])

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center text-[#F5F0E8] select-none">
        <div className="w-16 h-16 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-serif italic mb-2">No Analysis Payload</h1>
        <p className="text-[#8A8070] text-sm max-w-md mb-8">
          Upload a PDF on the main dashboard to run an active AI courtroom trial sequence first.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#C9A84C] hover:bg-[#D9B85C] text-[#0A0A0A] rounded-lg font-cinzel font-bold text-xs tracking-wider transition-all shadow-gold-soft"
        >
          Go Back Home
        </Link>
      </div>
    )
  }

  const { clauses, overall_risk, total_clauses_found } = data

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] font-sans relative selection:bg-[#C9A84C] selection:text-[#0A0A0A] overflow-x-hidden">
      
      {/* Subtle Repeating Diagonal Background Pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint opacity-40 z-0" />

      {/* Navigation Header */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-[#C9A84C]/15 backdrop-blur-md bg-[#0A0A0A]/40">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-1.5 text-[#8A8070] hover:text-[#F5F0E8] transition-colors text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
          <div className="w-px h-5 bg-[#C9A84C]/15" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#111111] border border-[#C9A84C]/35 flex items-center justify-center shadow-gold-soft">
              <Gavel className="w-3.5 h-3.5 text-[#C9A84C]" />
            </div>
            <span className="font-cinzel text-lg font-bold tracking-wider">
              <span className="text-[#F5F0E8]">Lex</span>
              <span className="text-[#C9A84C]">Guard</span>
            </span>
          </div>
        </div>
      </nav>

      {/* ── 1. Top Banner: Full Width Risk Banner ── */}
      <div className={`w-full py-12 px-6 border-b border-[#C9A84C]/20 text-center relative ${bannerBgClass(overall_risk)}`}>
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C9A84C]/25" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C9A84C]/25" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C9A84C]/25" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C9A84C]/25" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="font-serif italic text-4xl md:text-5xl font-black text-[#F5F0E8] tracking-widest mb-3 text-glow-gold uppercase">
            VERDICT: {overall_risk} RISK
          </h1>
          <p className="text-[#8A8070] text-xs font-cinzel font-bold tracking-wider">
            {clauses.length} risky clause{clauses.length !== 1 ? 's' : ''} identified in your contract
          </p>
        </motion.div>
      </div>
      
      {/* Thin Gold Divider line below top banner */}
      <div className="w-full h-[1px] bg-[#C9A84C]/20" />

      {/* ── Main body ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        
        {/* Staggered load list for clauses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="space-y-16"
        >
          {clauses.map((clause, idx) => {
            const cId = clause.clause_id || `clause_${idx}`

            return (
              <motion.section
                key={cId}
                id={cId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="pb-6 border-b border-[#C9A84C]/10 last:border-b-0"
              >
                
                {/* ── Clause Header block ── */}
                <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                  <div className="flex items-center gap-3">
                    {/* Clause index / gold badge pill */}
                    <span className="bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 text-[10px] font-cinzel font-bold rounded-full px-3.5 py-1 tracking-widest uppercase">
                      Clause {idx + 1}
                    </span>
                    <h3 className="font-serif italic text-lg text-white font-bold tracking-tight">
                      {clauseLabel(clause.type)}
                    </h3>
                  </div>

                  {/* Clause Risk Level Badge */}
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${riskBadgeClass(clause.risk_level)}`}>
                    {clause.risk_level} RISK
                  </span>
                </div>

                {/* Parchment Box original text */}
                <div className="border-l-4 border-l-[#C9A84C] bg-[#1A1509] p-5 rounded-r-xl mb-8 relative">
                  <span className="absolute top-2 right-3 text-[9px] font-serif italic text-[#C9A84C]/35 font-bold">Original Term Draft</span>
                  <p className="font-serif italic text-[#F5F0E8] text-xs md:text-sm leading-relaxed pr-6">
                    "{clause.text}"
                  </p>
                </div>

                {/* Courtroom side-by-side agent debriefings */}
                <div className="mb-8">
                  <CourtroomPanel clause={clause} />
                </div>

                {/* Timeline consequence forecaster */}
                <div>
                  <TimeMachine timeline={clause.timeline} />
                </div>
              </motion.section>
            )
          })}
        </motion.div>

        {/* ── 3. Bottom: AI Jury Verdict Matrix ── */}
        {clauses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-20 pt-12 border-t border-[#C9A84C]/35 bg-gradient-to-t from-[#1A160F]/60 to-[#0A0A0A] rounded-3xl p-8 relative overflow-hidden shadow-gold-soft"
          >
            {/* Elegant corner decals for high-end start-up layout */}
            <div className="absolute top-3 left-3 w-4.5 h-4.5 border-t border-l border-[#C9A84C]/30" />
            <div className="absolute top-3 right-3 w-4.5 h-4.5 border-t border-r border-[#C9A84C]/30" />
            <div className="absolute bottom-3 left-3 w-4.5 h-4.5 border-b border-l border-[#C9A84C]/30" />
            <div className="absolute bottom-3 right-3 w-4.5 h-4.5 border-b border-r border-[#C9A84C]/30" />

            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="font-serif italic text-3xl font-extrabold text-[#F5F0E8] mb-2 tracking-wide text-glow-gold">
                ⚖️ The AI Jury Has Reached Its Verdict
              </h2>
              <p className="text-[#8A8070] text-xs uppercase font-mono tracking-widest">
                Based on active agent debriefing of all clauses
              </p>
            </div>

            {/* Three Verdict Cards Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Defender Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-5 flex flex-col gap-3.5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8B0000]/40" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-serif italic font-bold text-red-400 tracking-wider">
                    Jury Defender verdict
                  </span>
                </div>
                <div className="py-2 text-center bg-[#8B0000]/10 border border-[#8B0000]/30 rounded">
                  <span className="text-red-400 font-cinzel font-black tracking-widest text-sm uppercase block">
                    REJECT CONTRACT
                  </span>
                </div>
                <p className="text-[#8A8070] text-xs leading-relaxed font-sans">
                  The Defender identified highly aggressive restrictive covenants designed to bind user liberties without appropriate compensation.
                </p>
              </div>

              {/* Prosecutor Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-5 flex flex-col gap-3.5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#1B3A5C]/40" />
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-serif italic font-bold text-blue-400 tracking-wider">
                    Jury Prosecutor verdict
                  </span>
                </div>
                <div className="py-2 text-center bg-[#1B3A5C]/20 border border-[#1B3A5C]/40 rounded">
                  <span className="text-blue-400 font-cinzel font-black tracking-widest text-sm uppercase block">
                    ACCEPT WITH WAIVER
                  </span>
                </div>
                <p className="text-[#8A8070] text-xs leading-relaxed font-sans">
                  The Prosecutor asserts terms are critical to guarantee corporate trade secrecy, suggesting standard company waiver indemnification.
                </p>
              </div>

              {/* Judge Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-5 flex flex-col gap-3.5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C9A84C]/40" />
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-xs font-serif italic font-bold text-[#C9A84C] tracking-wider">
                    Judge AI ruling
                  </span>
                </div>
                <div className="py-2 text-center bg-[#8B6914]/20 border border-[#C9A84C]/40 rounded">
                  <span className="text-[#C9A84C] font-cinzel font-black tracking-widest text-sm uppercase block">
                    NEGOTIATE DIRECTLY
                  </span>
                </div>
                <p className="text-[#8A8070] text-xs leading-relaxed font-sans">
                  The Judge AI recommends negotiating a direct revision of critical parameters using aggregated courtroom briefs as leverage.
                </p>
              </div>
            </div>

            {/* Aggregated Final Action Recommendation Banner */}
            <div className="bg-[#C9A84C] text-[#0A0A0A] rounded-xl p-6 shadow-md relative mb-8">
              <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#0A0A0A]/40" />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#0A0A0A]/40" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-[#0A0A0A] flex items-center justify-center shrink-0 shadow-md">
                  <Gavel className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h4 className="font-serif italic font-bold text-sm tracking-tight mb-1 text-[#0A0A0A] uppercase">
                    Final Recommendation
                  </h4>
                  <p className="text-[#0A0A0A] text-xs leading-relaxed font-sans font-medium">
                    {clauses
                      .filter((c) => c.risk_level === 'HIGH')
                      .map((c) => c.judge.negotiation_tip)
                      .join(' · ') || 'The contract contains acceptable terms. Exercise reasonable corporate diligence and sign securely.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action control row */}
            <div className="flex justify-center">
              <button
                onClick={() => alert('Hackathon Demo: Download Report payload compiled successfully!')}
                className="inline-flex items-center gap-2 border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] text-[#F5F0E8] font-cinzel font-bold text-xs tracking-widest py-3 px-8 rounded-lg transition-all duration-300 uppercase shadow-gold-soft hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Report</span>
              </button>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="relative z-10 text-center py-10 border-t border-[#C9A84C]/10 bg-[#111111]/30">
        <p className="text-[#8A8070] text-[10px] tracking-wide max-w-sm mx-auto">
          LexGuard is an automated simulator for educational mock debriefings. Consult certified local corporate lawyers before signing.
        </p>
      </footer>
    </div>
  )
}
