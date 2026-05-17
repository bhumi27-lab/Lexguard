import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gavel,
  Shield,
  Scale,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowLeft,
  Clock,
  TrendingUp,
  Minus,
  XCircle,
  MinusCircle,
  FileText,
} from 'lucide-react'

/* ── Types matching backend structured JSON output ── */

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW'
type Verdict = 'REJECT' | 'ACCEPT' | 'NEGOTIATE'

interface TimelineEvent {
  month: number
  event: string
}

interface Timeline {
  events: TimelineEvent[]
  scenario_best: string
  scenario_realistic: string
  scenario_worst: string
}

interface Clause {
  id?: string
  clause_id?: string
  text: string
  type: string
  risk_level: RiskLevel
  defender: { argument: string }
  prosecutor: { argument: string }
  judge: {
    verdict: Verdict
    reasoning: string
    negotiation_tip: string
  }
  timeline: Timeline
}

interface AnalysisResult {
  clauses: Clause[]
  overall_risk: RiskLevel
  total_clauses_found: number
}

/* ── Helper Functions ── */

function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-400 border border-red-500/30'
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
    default:
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  }
}

function riskDotClass(level: RiskLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-red-500'
    case 'MEDIUM':
      return 'bg-amber-500'
    case 'LOW':
      return 'bg-emerald-500'
    default:
      return 'bg-amber-500'
  }
}

function riskIcon(level: RiskLevel) {
  switch (level) {
    case 'HIGH':
      return <AlertTriangle className="w-3.5 h-3.5" />
    case 'MEDIUM':
      return <Info className="w-3.5 h-3.5" />
    case 'LOW':
      return <CheckCircle2 className="w-3.5 h-3.5" />
    default:
      return <Info className="w-3.5 h-3.5" />
  }
}

function verdictBadgeStyle(v: Verdict) {
  switch (v) {
    case 'REJECT':
      return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', Icon: XCircle }
    case 'NEGOTIATE':
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', Icon: MinusCircle }
    case 'ACCEPT':
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', Icon: CheckCircle2 }
    default:
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', Icon: MinusCircle }
  }
}

function clauseTypeLabel(type: string): string {
  if (!type) return 'Clause'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const MONTH_LABELS: Record<number, string> = {
  0: 'Day One',
  3: '3 Months',
  6: '6 Months',
  12: '1 Year',
  24: '2 Years',
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
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6 text-center text-slate-100 selection:bg-[#1B4FD8] selection:text-white">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Analysis Data</h1>
        <p className="text-slate-400 max-w-md mb-8">
          We couldn't retrieve any scanning results. Please drag and drop or select a valid PDF on the dashboard to scan.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#1B4FD8] hover:bg-[#2563EB] text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(27,79,216,0.3)]"
        >
          Go Back Home
        </Link>
      </div>
    )
  }

  const { clauses, overall_risk, total_clauses_found } = data

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 font-sans relative selection:bg-[#1B4FD8] selection:text-white">
      {/* Background network faint grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid-faint opacity-50"
        style={{ backgroundSize: '40px 40px' }}
      />

      {/* ── 1. Top bar: overall risk badge + total clauses count ── */}
      <header className="sticky top-0 z-30 bg-[#0A0E1A]/85 backdrop-blur-md border-b border-[#1E2A45] shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          {/* Brand/Back Link */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to upload</span>
            </Link>
            <div className="w-px h-5 bg-[#1E2A45]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1B4FD8] flex items-center justify-center shadow-[0_0_15px_rgba(27,79,216,0.4)]">
                <Gavel className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">LexGuard</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-xs text-slate-400 font-mono">
              Risk Clauses Found:{' '}
              <span className="text-slate-200 font-semibold">{total_clauses_found || clauses.length}</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${riskBadgeClass(overall_risk)}`}>
              {riskIcon(overall_risk)}
              Overall {overall_risk} Risk
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Main Section ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        
        {/* Page title card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0F1629]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1E2A45] mb-10 shadow-card"
        >
          <h1 className="text-2xl font-black tracking-tight mb-2 text-white">
            LexGuard Verdict Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            AI agents analyzed your contract. Scroll down to see full courtroom defense briefs and the Contract Time Machine consequence forecast.
          </p>
        </motion.div>

        {/* ── 2. For each clause: Courtroom Panel and Time Machine ── */}
        {clauses.length === 0 ? (
          <div className="bg-[#0F1629]/70 backdrop-blur-md p-16 text-center rounded-2xl border border-[#1E2A45] shadow-card">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Clean Scan Result</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No high-risk keywords or clauses matched our database search. Your contract appears standard.
            </p>
          </div>
        ) : (
          clauses.map((clause, idx) => {
            const clauseId = clause.id || clause.clause_id || `clause_${idx}`
            const risk = riskBadgeClass(clause.risk_level)
            const riskDot = riskDotClass(clause.risk_level)
            const vConfig = verdictBadgeStyle(clause.judge.verdict)
            const VerdictIcon = vConfig.Icon

            return (
              <section key={clauseId} id={clauseId} className="mb-14 scroll-mt-24">
                
                {/* Clause category header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#1B4FD8]/15 border border-[#1B4FD8]/30 flex items-center justify-center text-xs font-bold text-blue-400 shadow-[0_0_12px_rgba(27,79,216,0.1)]">
                    {idx + 1}
                  </div>
                  <h2 className="text-white font-bold text-base tracking-tight">
                    {clauseTypeLabel(clause.type)} Clause
                  </h2>
                  <div className="flex-1 h-px bg-[#1E2A45] opacity-50" />
                </div>

                {/* ── Courtroom Panel Box ── */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#0F1629]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1E2A45] mb-5 shadow-card"
                >
                  {/* Status header inside Card */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-4 border-b border-[#1E2A45]/50">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
                          Clause Registry: {clauseId}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${risk}`}>
                        {riskIcon(clause.risk_level)}
                        {clause.risk_level} RISK
                      </div>
                    </div>

                    {/* Verdict block */}
                    <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${vConfig.color} ${vConfig.bg} ${vConfig.border}`}>
                      <VerdictIcon className="w-3.5 h-3.5" />
                      {clause.judge.verdict}
                    </div>
                  </div>

                  {/* Clause Original Text */}
                  <div className="bg-[#0A0E1A] border border-[#1E2A45]/80 rounded-xl p-4 mb-6">
                    <p className="text-slate-300 text-xs font-mono leading-relaxed break-words">
                      {clause.text}
                    </p>
                  </div>

                  {/* 3 side-by-side agent cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Defender (Red left border, red text) */}
                    <div className="bg-[#0A0E1A]/40 border border-[#1E2A45] border-l-4 border-l-red-500 rounded-r-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-extrabold text-red-400 uppercase tracking-wider">
                          Defender Agent
                        </span>
                      </div>
                      <p className="text-slate-350 text-xs leading-relaxed">
                        {clause.defender.argument}
                      </p>
                    </div>

                    {/* Prosecutor (Blue left border, blue text) */}
                    <div className="bg-[#0A0E1A]/40 border border-[#1E2A45] border-l-4 border-l-[#1B4FD8] rounded-r-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                          Prosecutor Agent
                        </span>
                      </div>
                      <p className="text-slate-350 text-xs leading-relaxed">
                        {clause.prosecutor.argument}
                      </p>
                    </div>

                    {/* Judge (Green left border) */}
                    <div className="bg-[#0A0E1A]/40 border border-[#1E2A45] border-l-4 border-l-emerald-500 rounded-r-xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                          Judge Verdict
                        </span>
                      </div>
                      <p className="text-slate-350 text-xs leading-relaxed">
                        {clause.judge.reasoning}
                      </p>

                      {/* Action tip highlight */}
                      <div className="pt-2 border-t border-[#1E2A45]/80 mt-auto">
                        <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider block mb-1">
                          Negotiation Tip:
                        </span>
                        <p className="text-emerald-200/90 text-xs leading-relaxed">
                          {clause.judge.negotiation_tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── Contract Time Machine Section ── */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#0F1629]/80 backdrop-blur-md p-6 rounded-2xl border border-[#1E2A45] shadow-card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-[#1B4FD8]/10 border border-[#1B4FD8]/25 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-sm">Contract Time Machine</h4>
                      <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">
                        Future consequence sequence simulation
                      </p>
                    </div>
                  </div>

                  {/* Staggered animated vertical timeline */}
                  <motion.ol
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.2 } },
                    }}
                    className="relative pl-6 border-l border-[#1E2A45] space-y-6 mb-8 ml-3"
                  >
                    {clause.timeline.events
                      .slice()
                      .sort((a, b) => a.month - b.month)
                      .map((ev, i) => (
                        <motion.li
                          key={i}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                          }}
                          className="relative"
                        >
                          {/* Indicator bullet */}
                          <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#1B4FD8] bg-[#0A0E1A]" />

                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-[#1B4FD8] text-xs font-bold font-mono uppercase tracking-wider">
                              {MONTH_LABELS[ev.month] ?? `Month ${ev.month}`}
                            </span>
                            <span className="text-slate-600 text-[10px] font-mono">·</span>
                            <span className="text-slate-500 text-[10px] font-mono">M+{ev.month}</span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">
                            {ev.event}
                          </p>
                        </motion.li>
                      ))}
                  </motion.ol>

                  {/* Three scenario cards: green/yellow/red */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#1E2A45]/50">
                    {/* Scenario Best - Green */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Best Case Scenario
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {clause.timeline.scenario_best}
                      </p>
                    </div>

                    {/* Scenario Realistic - Yellow */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Minus className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Realistic Scenario
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {clause.timeline.scenario_realistic}
                      </p>
                    </div>

                    {/* Scenario Worst - Red */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                          Worst Case Scenario
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {clause.timeline.scenario_worst}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </section>
            )
          })
        )}

        {/* ── 3. Bottom: AI Jury Verdict Table ── */}
        {clauses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mt-6 mb-16"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1B4FD8]/10 border border-[#1B4FD8]/25 flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#1B4FD8]" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg tracking-tight">AI Jury Consensus</h3>
                <p className="text-slate-500 text-xs font-mono">Consolidated scoreboard of agent outputs</p>
              </div>
            </div>

            {/* Verdict Table */}
            <div className="bg-[#0F1629]/80 backdrop-blur-md rounded-2xl border border-[#1E2A45] shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-[#1E2A45] bg-[#0F1629]/50 text-slate-400 uppercase font-bold tracking-wider">
                      <th className="px-6 py-4 w-12 text-center">#</th>
                      <th className="px-6 py-4">Clause Type</th>
                      <th className="px-6 py-4 text-center">Risk level</th>
                      <th className="px-6 py-4">Defender brief</th>
                      <th className="px-6 py-4">Prosecutor brief</th>
                      <th className="px-6 py-4 text-center">Verdict Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clauses.map((clause, idx) => {
                      const v = verdictBadgeStyle(clause.judge.verdict)
                      const isHigh = clause.risk_level === 'HIGH'
                      const VerdictIcon = v.Icon

                      return (
                        <tr
                          key={clause.id || clause.clause_id || idx}
                          className={`border-b border-[#1E2A45]/60 last:border-0 transition-colors ${
                            isHigh ? 'bg-red-500/[0.02] hover:bg-red-500/[0.05]' : 'hover:bg-[#0F1629]/40'
                          }`}
                        >
                          <td className="px-6 py-4 text-center text-slate-500 font-mono font-medium">{idx + 1}</td>
                          <td className="px-6 py-4 font-semibold text-slate-200">
                            <a
                              href={`#${clause.id || clause.clause_id || idx}`}
                              className="hover:text-blue-400 hover:underline transition-all"
                            >
                              {clauseTypeLabel(clause.type)}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass(clause.risk_level)}`}>
                              {riskIcon(clause.risk_level)}
                              {clause.risk_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-[200px]">
                            <p className="text-slate-400 leading-relaxed line-clamp-2">
                              {clause.defender.argument}
                            </p>
                          </td>
                          <td className="px-6 py-4 max-w-[200px]">
                            <p className="text-slate-400 leading-relaxed line-clamp-2">
                              {clause.prosecutor.argument}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 font-extrabold tracking-wider ${v.color}`}>
                              <VerdictIcon className="w-3.5 h-3.5" />
                              {clause.judge.verdict}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aggregated Final Action Recommendation */}
            {clauses.some((c) => c.risk_level === 'HIGH') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 p-5 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-sm tracking-tight mb-1.5">
                    Judge Final Negotiation Directives
                  </h4>
                  <div className="space-y-3">
                    {clauses
                      .filter((c) => c.risk_level === 'HIGH')
                      .map((c, i) => (
                        <div key={i} className="text-xs leading-relaxed text-slate-350">
                          <span className="font-mono text-red-300 font-extrabold uppercase mr-1.5">
                            [{clauseTypeLabel(c.type)}]:
                          </span>
                          {c.judge.negotiation_tip}
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="relative z-10 text-center py-8 border-t border-[#1E2A45] bg-[#0A0E1A]/85">
        <p className="text-slate-500 text-[10px] tracking-wide max-w-md mx-auto">
          LexGuard is an automated simulator for educational mock debriefings. Consult certified local corporate lawyers before signing.
        </p>
      </footer>
    </div>
  )
}
