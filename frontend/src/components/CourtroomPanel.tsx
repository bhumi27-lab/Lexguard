import { motion } from 'framer-motion'
import { Shield, Scale, Gavel, AlertTriangle, Info, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import type { Clause, RiskLevel, Verdict } from '../types'

interface Props {
  clause: Clause
}

function riskConfig(level: RiskLevel) {
  switch (level) {
    case 'HIGH':
      return { badge: 'badge-premium-high high-risk-pulse', dot: 'bg-red-600', label: 'High Risk', Icon: AlertTriangle }
    case 'MEDIUM':
      return { badge: 'badge-premium-medium', dot: 'bg-[#C9A84C]', label: 'Medium Risk', Icon: Info }
    case 'LOW':
      return { badge: 'badge-premium-low', dot: 'bg-[#2C4A2E]', label: 'Low Risk', Icon: CheckCircle2 }
    default:
      return { badge: 'badge-premium-medium', dot: 'bg-[#C9A84C]', label: 'Medium Risk', Icon: Info }
  }
}

function verdictBadgeStyle(verdict: Verdict) {
  switch (verdict) {
    case 'REJECT':
      return { color: 'text-red-400', bg: 'bg-[#8B0000]/20', border: 'border-[#8B0000]/40', Icon: XCircle, label: 'REJECT' }
    case 'NEGOTIATE':
      return { color: 'text-amber-400', bg: 'bg-[#8B6914]/20', border: 'border-[#8B6914]/40', Icon: MinusCircle, label: 'NEGOTIATE' }
    case 'ACCEPT':
      return { color: 'text-emerald-400', bg: 'bg-[#2C4A2E]/20', border: 'border-[#2C4A2E]/40', Icon: CheckCircle2, label: 'ACCEPT' }
    default:
      return { color: 'text-amber-400', bg: 'bg-[#8B6914]/20', border: 'border-[#8B6914]/40', Icon: MinusCircle, label: 'NEGOTIATE' }
  }
}

function clauseTypeLabel(type: string): string {
  if (!type) return 'Clause'
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export default function CourtroomPanel({ clause }: Props) {
  const risk = riskConfig(clause.risk_level)
  const verdict = verdictBadgeStyle(clause.judge.verdict)
  const RiskIcon = risk.Icon
  const VerdictIcon = verdict.Icon
  const clauseId = clause.clause_id

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-6 mb-6 shadow-md relative"
    >
      {/* Antique parchment frame corner details */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#C9A84C]/20" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C9A84C]/20" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#C9A84C]/20" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#C9A84C]/20" />

      {/* Header bar */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-4 border-b border-[#C9A84C]/10">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest text-[#8A8070] uppercase">
              Clause Registry: {clauseId || 'Unmapped'}
            </span>
          </div>

          {/* Risk Level Badge */}
          <div className={risk.badge}>
            <RiskIcon className="w-3.5 h-3.5" />
            <span className="font-serif italic font-semibold">{risk.label}</span>
          </div>
        </div>

        {/* Action verdict label inside top right */}
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
          <VerdictIcon className="w-3.5 h-3.5" />
          {verdict.label}
        </div>
      </div>

      {/* Clause raw text: parchment box */}
      <div className="bg-[#1A1509] border-l-4 border-l-[#C9A84C] rounded-r-xl p-4.5 mb-6 relative">
        <div className="absolute top-2 right-3 text-[9px] font-serif italic text-[#C9A84C]/45 select-none font-semibold">
          Original Legal Script
        </div>
        <p className="text-[#F5F0E8] text-xs md:text-sm font-serif italic leading-relaxed break-words pr-4">
          "{clause.text}"
        </p>
      </div>

      {/* ⚖️ Section Label */}
      <div className="flex flex-col gap-0.5 mb-4">
        <h4 className="text-[#C9A84C] font-serif italic text-sm font-semibold tracking-wider flex items-center gap-2">
          <span>⚖️ AI Courtroom</span>
        </h4>
        <p className="text-[#8A8070] text-[10px] font-sans">Three agents have reviewed this clause</p>
      </div>

      {/* Three side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* DEFENDER CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#8B0000] rounded-b-xl p-4.5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0A0A0A] border border-[#8B0000]/25 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#8B0000]" />
            </div>
            <div>
              <span className="text-xs font-serif italic font-bold text-[#8B0000] tracking-wider block">
                The Defender
              </span>
              <span className="text-[9px] text-[#8A8070] font-sans block">
                Protecting your interests
              </span>
            </div>
          </div>
          <p className="text-[#F5F0E8] text-xs leading-relaxed font-sans">
            {clause.defender.argument}
          </p>
        </div>

        {/* PROSECUTOR CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#1B3A5C] rounded-b-xl p-4.5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0A0A0A] border border-[#1B3A5C]/25 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#1B3A5C]" />
            </div>
            <div>
              <span className="text-xs font-serif italic font-bold text-[#1B3A5C] tracking-wider block">
                The Prosecutor
              </span>
              <span className="text-[9px] text-[#8A8070] font-sans block">
                The corporate perspective
              </span>
            </div>
          </div>
          <p className="text-[#F5F0E8] text-xs leading-relaxed font-sans">
            {clause.prosecutor.argument}
          </p>
        </div>

        {/* JUDGE CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#C9A84C] rounded-b-xl p-4.5 flex flex-col gap-4.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center">
              <Gavel className="w-3.5 h-3.5 text-[#C9A84C]" />
            </div>
            <div>
              <span className="text-xs font-serif italic font-bold text-[#C9A84C] tracking-wider block">
                Judge AI
              </span>
              <span className="text-[9px] text-[#8A8070] font-sans block">
                Neutral verdict
              </span>
            </div>
          </div>

          {/* Verdict Pill */}
          <div className="flex justify-center py-2.5 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded-lg">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
              {verdict.label}
            </span>
          </div>

          <p className="text-[#F5F0E8] text-xs leading-relaxed font-sans">
            {clause.judge.reasoning}
          </p>

          {/* Negotiation tip block */}
          <div className="mt-auto pt-3.5 border-t border-[#C9A84C]/15">
            <div className="bg-[#8B6914]/10 border-l-2 border-l-[#C9A84C] rounded-r p-3">
              <span className="text-[9px] text-[#C9A84C] font-mono font-bold uppercase tracking-wider block mb-1">
                Negotiation Tip
              </span>
              <p className="text-[#F5F0E8] text-xs leading-relaxed font-sans">
                {clause.judge.negotiation_tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
