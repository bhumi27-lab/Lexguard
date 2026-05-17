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
import { jsPDF } from 'jspdf'
import CourtroomPanel from '../components/CourtroomPanel'
import TimeMachine from '../components/TimeMachine'
import type { AnalysisResult, RiskLevel } from '../types'

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

/* ── 📊 RISK BREAKDOWN Donut Chart Component ── */

function RiskDonutChart({ high, medium, low }: { high: number; medium: number; low: number }) {
  const total = high + medium + low || 1
  const highPct = (high / total) * 100
  const mediumPct = (medium / total) * 100
  const lowPct = (low / total) * 100

  const radius = 38
  const strokeWidth = 9
  const circ = 2 * Math.PI * radius

  // Circular dashoffsets
  const lowDashOffset = circ - (lowPct / 100) * circ
  const mediumDashOffset = circ - (mediumPct / 100) * circ
  const highDashOffset = circ - (highPct / 100) * circ

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-7 shadow-md max-w-lg mx-auto mb-14 relative">
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#C9A84C]/35" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#C9A84C]/35" />

      {/* SVG Donut Circle */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Base Track */}
          <circle cx="50" cy="50" r={radius} stroke="#1A1A1A" strokeWidth={strokeWidth} fill="transparent" />
          
          {/* Low Risk (Green) */}
          {lowPct > 0 && (
            <circle
              cx="50" cy="50" r={radius}
              stroke="#2C4A2E"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={lowDashOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          )}

          {/* Medium Risk (Yellow) */}
          {mediumPct > 0 && (
            <circle
              cx="50" cy="50" r={radius}
              stroke="#C9A84C"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={mediumDashOffset}
              transform={`rotate(${(lowPct / 100) * 360} 50 50)`}
              strokeLinecap="round"
              fill="transparent"
            />
          )}

          {/* High Risk (Red) */}
          {highPct > 0 && (
            <circle
              cx="50" cy="50" r={radius}
              stroke="#8B0000"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={highDashOffset}
              transform={`rotate(${((lowPct + mediumPct) / 100) * 360} 50 50)`}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-cinzel text-[9px] text-[#8A8070] uppercase tracking-widest">Risks</span>
          <span className="font-serif italic text-base font-bold text-[#F5F0E8]">{total} Total</span>
        </div>
      </div>

      {/* Legends column */}
      <div className="flex flex-col gap-2.5 font-sans">
        <h4 className="text-xs font-cinzel font-bold text-[#C9A84C] tracking-widest uppercase mb-1">
          Risk Allocation
        </h4>
        
        <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B0000] shrink-0" />
          <span>High Risk: <strong className="text-white font-bold">{high}</strong> ({Math.round(highPct)}%)</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] shrink-0" />
          <span>Medium Risk: <strong className="text-white font-bold">{medium}</strong> ({Math.round(mediumPct)}%)</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#F5F0E8]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2C4A2E] shrink-0" />
          <span>Low Risk: <strong className="text-white font-bold">{low}</strong> ({Math.round(lowPct)}%)</span>
        </div>
      </div>
    </div>
  )
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

  const { clauses, overall_risk } = data

  const highRiskCount = clauses.filter(c => c.risk_level === 'HIGH').length
  const mediumRiskCount = clauses.filter(c => c.risk_level === 'MEDIUM').length
  const lowRiskCount = clauses.filter(c => c.risk_level === 'LOW').length

  // Dynamically calculate Contract Integrity Health Score: starting at 100, min 10
  let healthScore = 100
  if (clauses.length > 0) {
    const penalty = (highRiskCount * 30) + (mediumRiskCount * 12) + (lowRiskCount * 2)
    healthScore = Math.max(10, Math.round(100 - penalty))
  }

  // 📝 jsPDF Download Report Handler
  const handleDownloadReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - 2 * margin
    let y = 25

    const addHeaderAndFooter = (pageNum: number) => {
      // Top gold header border line
      doc.setDrawColor(201, 168, 76) // Antique gold
      doc.setLineWidth(0.4)
      doc.line(margin, 12, pageWidth - margin, 12)

      // Header labels
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(138, 128, 112)
      doc.text('LEXGUARD — AI CONTRACT COURTROOM VERDICT REPORT', margin, 9)

      // Footer labels
      doc.setFont('Helvetica', 'normal')
      doc.text(`CONFIDENTIAL · PAGE ${pageNum}`, margin, pageHeight - 8)
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, pageHeight - 8)
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
    }

    addHeaderAndFooter(1)

    // Document Title
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(20, 20, 20)
    doc.text('LEXGUARD TRIAL & RISK VERDICT AUDIT', margin, y)
    y += 10

    // Divider Line
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // Overall Risk Verdict & health score
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(13)
    if (overall_risk === 'HIGH') {
      doc.setTextColor(139, 0, 0) // Deep red
    } else if (overall_risk === 'MEDIUM') {
      doc.setTextColor(139, 105, 20) // Bronze/gold
    } else {
      doc.setTextColor(44, 74, 46) // Forest green
    }
    doc.text(`OVERALL AUDIT VERDICT: ${overall_risk} RISK`, margin, y)
    y += 6

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(60, 60, 60)
    doc.text(`Contract Integrity Health Score: ${healthScore} / 100`, margin, y)
    y += 10

    // Risk Stats
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text('Clause Risk Breakdown Metrics', margin, y)
    y += 6

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(80, 80, 80)
    doc.text(`• High Risk Terms: ${highRiskCount} clause(s)`, margin + 5, y)
    y += 5
    doc.text(`• Medium Risk Terms: ${mediumRiskCount} clause(s)`, margin + 5, y)
    y += 5
    doc.text(`• Low Risk Terms: ${lowRiskCount} clause(s)`, margin + 5, y)
    y += 10

    // Final Action Guidelines
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text('AI Jury Joint Final Action Recommendation', margin, y)
    y += 6

    const tips = clauses
      .filter((c) => c.risk_level === 'HIGH')
      .map((c) => c.judge.negotiation_tip)
      .join(' · ') || 'The contract contains acceptable terms. Exercise standard corporate prudence and sign securely.'
    
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    const splitTips = doc.splitTextToSize(tips, contentWidth)
    doc.text(splitTips, margin, y)
    y += splitTips.length * 4.5 + 12

    // Loop through clauses
    let currentPage = 1
    clauses.forEach((clause, idx) => {
      // Check space
      if (y > pageHeight - 55) {
        doc.addPage()
        currentPage += 1
        addHeaderAndFooter(currentPage)
        y = 25
      }

      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11.5)
      doc.setTextColor(201, 168, 76)
      doc.text(`CLAUSE ${idx + 1}: ${clauseLabel(clause.type)} [${clause.risk_level} RISK]`, margin, y)
      y += 6

      // Raw Draft Box
      doc.setFont('Helvetica', 'oblique')
      doc.setFontSize(9)
      doc.setTextColor(90, 90, 90)
      const splitText = doc.splitTextToSize(`"${clause.text}"`, contentWidth - 4)
      doc.text(splitText, margin + 2, y)
      y += splitText.length * 4.5 + 7

      // AI Debates
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)

      // Defender
      doc.setTextColor(139, 0, 0)
      doc.text('Defender Analysis:', margin, y)
      y += 4
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const splitDef = doc.splitTextToSize(clause.defender.argument, contentWidth)
      doc.text(splitDef, margin, y)
      y += splitDef.length * 4 + 4.5

      // Check space
      if (y > pageHeight - 45) {
        doc.addPage()
        currentPage += 1
        addHeaderAndFooter(currentPage)
        y = 25
      }

      // Prosecutor
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(27, 58, 92)
      doc.text('Prosecutor Analysis:', margin, y)
      y += 4
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const splitPros = doc.splitTextToSize(clause.prosecutor.argument, contentWidth)
      doc.text(splitPros, margin, y)
      y += splitPros.length * 4 + 4.5

      // Check space
      if (y > pageHeight - 55) {
        doc.addPage()
        currentPage += 1
        addHeaderAndFooter(currentPage)
        y = 25
      }

      // Judge
      doc.setFont('Helvetica', 'bold')
      doc.setTextColor(201, 168, 76)
      doc.text(`Judge AI Verdict: [${clause.judge.verdict}]`, margin, y)
      y += 4
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const splitReason = doc.splitTextToSize(`${clause.judge.reasoning} Negotiation Tip: ${clause.judge.negotiation_tip}`, contentWidth)
      doc.text(splitReason, margin, y)
      y += splitReason.length * 4 + 10
    })

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '_').split('.')[0]
    doc.save(`LexGuard_Report_${timestamp}.pdf`)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] font-sans relative selection:bg-[#C9A84C] selection:text-[#0A0A0A] overflow-x-hidden">
      
      {/* Subtle Repeating Diagonal Background Pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint opacity-40 z-0" />

      {/* Navigation Header */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-[#C9A84C]/15 backdrop-blur-md bg-[#0A0A0A]/40">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-1.5 text-[#F5F0E8] hover:text-[#C9A84C] transition-colors text-sm font-semibold uppercase tracking-wider">
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

      {/* ── 1. Top Banner: Full Width Risk Banner with Circular Health Score ── */}
      <div className={`w-full py-12 px-6 border-b border-[#C9A84C]/20 relative ${bannerBgClass(overall_risk)}`}>
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#C9A84C]/25" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#C9A84C]/25" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#C9A84C]/25" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#C9A84C]/25" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6 text-center md:text-left"
        >
          <div>
            <h1 className="font-serif italic text-4xl md:text-5xl font-black text-[#F5F0E8] tracking-widest mb-3 text-glow-gold uppercase">
              VERDICT: {overall_risk} RISK
            </h1>
            <p className="text-[#F5F0E8] text-sm font-cinzel font-bold tracking-wider">
              {clauses.length} risky clause{clauses.length !== 1 ? 's' : ''} identified in your contract
            </p>
          </div>

          {/* 🌟 circular progress health score indicator */}
          <div className="relative flex items-center justify-center shrink-0 shadow-gold-soft">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Outer track */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#C9A84C"
                strokeWidth="8"
                strokeOpacity="0.15"
                fill="transparent"
              />
              {/* Glowing Dynamic Circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#C9A84C"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (healthScore / 100) * 251.2}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.3))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-cinzel text-xl font-black text-[#F5F0E8]">{healthScore}</span>
              <span className="text-[8px] text-[#C9A84C] font-mono tracking-widest uppercase">Health</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Thin Gold Divider line below top banner */}
      <div className="w-full h-[1px] bg-[#C9A84C]/20" />

      {/* ── Main body ── */}
      <main className="relative z-10 w-full max-w-full px-12 py-12">

        {/* ── 2. RISK BREAKDOWN donut/pie chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <RiskDonutChart high={highRiskCount} medium={mediumRiskCount} low={lowRiskCount} />
        </motion.div>
        
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
                    <span className="bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 text-xs font-cinzel font-bold rounded-full px-4 py-1.5 tracking-widest uppercase">
                      Clause {idx + 1}
                    </span>
                    <h3 className="font-serif italic text-2xl text-white font-bold tracking-tight">
                      {clauseLabel(clause.type)}
                    </h3>
                  </div>

                  {/* Clause Risk Level Badge */}
                  <span className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${riskBadgeClass(clause.risk_level)}`}>
                    {clause.risk_level} RISK
                  </span>
                </div>

                {/* Parchment Box original text */}
                <div className="border-l-4 border-l-[#C9A84C] bg-[#1A1509] p-5 rounded-r-xl mb-8 relative">
                  <span className="absolute top-2 right-3 text-[10px] font-serif italic text-[#C9A84C]/35 font-bold">Original Term Draft</span>
                  <p className="font-serif italic text-[#F5F0E8] text-base md:text-lg leading-relaxed pr-6">
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
            {/* Decal corners */}
            <div className="absolute top-3 left-3 w-4.5 h-4.5 border-t border-l border-[#C9A84C]/30" />
            <div className="absolute top-3 right-3 w-4.5 h-4.5 border-t border-r border-[#C9A84C]/30" />
            <div className="absolute bottom-3 left-3 w-4.5 h-4.5 border-b border-l border-[#C9A84C]/30" />
            <div className="absolute bottom-3 right-3 w-4.5 h-4.5 border-b border-r border-[#C9A84C]/30" />

            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="font-serif italic text-4xl font-extrabold text-[#F5F0E8] mb-2 tracking-wide text-glow-gold">
                ⚖️ The AI Jury Has Reached Its Verdict
              </h2>
              <p className="text-[#F5F0E8] text-sm uppercase font-mono tracking-widest">
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
                  <span className="text-sm font-serif italic font-bold text-red-400 tracking-wider">
                    Jury Defender verdict
                  </span>
                </div>
                <div className="py-2.5 text-center bg-[#8B0000]/10 border border-[#8B0000]/30 rounded">
                  <span className="text-red-400 font-cinzel font-black tracking-widest text-base uppercase block">
                    REJECT CONTRACT
                  </span>
                </div>
                <p className="text-[#F5F0E8] text-sm leading-relaxed font-sans font-normal opacity-90">
                  The Defender identified highly aggressive restrictive covenants designed to bind user liberties without appropriate compensation.
                </p>
              </div>

              {/* Prosecutor Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-5 flex flex-col gap-3.5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#1B3A5C]/40" />
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-serif italic font-bold text-blue-400 tracking-wider">
                    Jury Prosecutor verdict
                  </span>
                </div>
                <div className="py-2.5 text-center bg-[#1B3A5C]/20 border border-[#1B3A5C]/40 rounded">
                  <span className="text-blue-400 font-cinzel font-black tracking-widest text-base uppercase block">
                    ACCEPT WITH WAIVER
                  </span>
                </div>
                <p className="text-[#F5F0E8] text-sm leading-relaxed font-sans font-normal opacity-90">
                  The Prosecutor asserts terms are critical to guarantee corporate trade secrecy, suggesting standard company waiver indemnification.
                </p>
              </div>

              {/* Judge Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-5 flex flex-col gap-3.5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C9A84C]/40" />
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#C9A84C]" />
                  <span className="text-sm font-serif italic font-bold text-[#C9A84C] tracking-wider">
                    Judge AI ruling
                  </span>
                </div>
                <div className="py-2.5 text-center bg-[#8B6914]/20 border border-[#C9A84C]/40 rounded">
                  <span className="text-[#C9A84C] font-cinzel font-black tracking-widest text-base uppercase block">
                    NEGOTIATE DIRECTLY
                  </span>
                </div>
                <p className="text-[#F5F0E8] text-sm leading-relaxed font-sans font-normal opacity-90">
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
                  <h4 className="font-serif italic font-bold text-base tracking-tight mb-1 text-[#0A0A0A] uppercase">
                    Final Recommendation
                  </h4>
                  <p className="text-[#0A0A0A] text-sm leading-relaxed font-sans font-bold">
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
                onClick={handleDownloadReport}
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
        <p className="text-[#F5F0E8] text-xs tracking-wide max-w-sm mx-auto opacity-75">
          LexGuard is an automated simulator for educational mock debriefings. Consult certified local corporate lawyers before signing.
        </p>
      </footer>
    </div>
  )
}
