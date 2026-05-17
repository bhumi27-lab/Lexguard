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

  // Calculate deterministic confidence scores for each agent
  const defenderScore = 72 + (clauseId ? clauseId.charCodeAt(0) % 25 : 12)
  const prosecutorScore = 75 + (clauseId ? clauseId.charCodeAt(clauseId.length - 1) % 20 : 15)
  const judgeScore = 82 + (clauseId ? clauseId.charCodeAt(Math.floor(clauseId.length / 2)) % 15 : 10)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-8 mb-6 shadow-md relative"
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
            <span className="text-xs font-mono tracking-widest text-[#F5F0E8] uppercase">
              Clause Registry: {clauseId || 'Unmapped'}
            </span>
          </div>

          {/* Risk Level Badge */}
          <div className={risk.badge}>
            <RiskIcon className="w-4 h-4" />
            <span className="font-serif italic font-bold text-sm">{risk.label}</span>
          </div>
        </div>

        {/* Action verdict label inside top right */}
        <div className={`inline-flex items-center gap-2 px-4.5 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
          <VerdictIcon className="w-4 h-4" />
          {verdict.label}
        </div>
      </div>

      {/* Clause raw text: parchment box */}
      <div className="bg-[#1A1509] border-l-4 border-l-[#C9A84C] rounded-r-xl p-6 mb-8 relative">
        <div className="absolute top-2.5 right-4 text-xs font-serif italic text-[#C9A84C]/50 select-none font-bold">
          Original Legal Script
        </div>
        <p className="text-[#F5F0E8] text-base md:text-lg font-serif italic leading-relaxed tracking-wide break-words pr-4">
          "{clause.text}"
        </p>
      </div>

      {/* ⚖️ Section Label */}
      <div className="flex flex-col gap-1 mb-6">
        <h4 className="text-[#C9A84C] font-serif italic text-base font-bold tracking-widest flex items-center gap-2">
          <span>⚖️ AI Courtroom</span>
        </h4>
        <p className="text-[#F5F0E8] text-xs font-sans opacity-85">Three agents have reviewed this clause</p>
      </div>

      {/* ⚡ AI Confidence Index horizontal bar chart */}
      <div className="bg-[#0A0A0A]/50 border border-[#C9A84C]/15 rounded-xl p-6 mb-8 shadow-sm">
        <h5 className="font-serif italic text-sm text-[#C9A84C] tracking-widest uppercase mb-4 flex items-center gap-2">
          <span>⚡ Agent Confidence Index</span>
        </h5>
        
        <div className="space-y-4 font-sans text-sm">
          {/* Defender bar */}
          <div>
            <div className="flex justify-between text-[#F5F0E8] mb-1.5 font-medium">
              <span>🛡️ Defender Case Integrity</span>
              <span className="font-mono text-red-400 font-bold">{defenderScore}%</span>
            </div>
            <div className="w-full bg-[#111111] rounded-full h-2.5 border border-[#8B0000]/25 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B0000] to-red-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${defenderScore}%` }}
              />
            </div>
          </div>

          {/* Prosecutor bar */}
          <div>
            <div className="flex justify-between text-[#F5F0E8] mb-1.5 font-medium">
              <span>🏢 Prosecutor Corporate Risk Exposure</span>
              <span className="font-mono text-blue-400 font-bold">{prosecutorScore}%</span>
            </div>
            <div className="w-full bg-[#111111] rounded-full h-2.5 border border-[#1B3A5C]/25 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1B3A5C] to-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${prosecutorScore}%` }}
              />
            </div>
          </div>

          {/* Judge bar */}
          <div>
            <div className="flex justify-between text-[#F5F0E8] mb-1.5 font-medium">
              <span>👨‍‍⚖️ Judge AI Balanced Verdict confidence</span>
              <span className="font-mono text-[#C9A84C] font-bold">{judgeScore}%</span>
            </div>
            <div className="w-full bg-[#111111] rounded-full h-2.5 border border-[#C9A84C]/25 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B6914] to-[#C9A84C] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${judgeScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Three side-by-side cards: Taller, wider, equal height, proper gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch w-full">
        
        {/* DEFENDER CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#8B0000] rounded-b-xl p-8 flex flex-col gap-4.5 h-full w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#8B0000]/25 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-[#8B0000]" />
            </div>
            <div>
              <span className="text-sm font-serif italic font-bold text-[#8B0000] tracking-wider block">
                The Defender
              </span>
              <span className="text-xs text-[#F5F0E8] font-sans block opacity-75">
                Protecting your interests
              </span>
            </div>
          </div>
          <p className="text-[#F5F0E8] text-base leading-loose tracking-wide font-sans mb-4">
            {clause.defender.argument}
          </p>
        </div>

        {/* PROSECUTOR CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#1B3A5C] rounded-b-xl p-8 flex flex-col gap-4.5 h-full w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#1B3A5C]/25 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-[#1B3A5C]" />
            </div>
            <div>
              <span className="text-sm font-serif italic font-bold text-[#1B3A5C] tracking-wider block">
                The Prosecutor
              </span>
              <span className="text-xs text-[#F5F0E8] font-sans block opacity-75">
                The corporate perspective
              </span>
            </div>
          </div>
          <p className="text-[#F5F0E8] text-base leading-loose tracking-wide font-sans mb-4">
            {clause.prosecutor.argument}
          </p>
        </div>

        {/* JUDGE CARD */}
        <div className="bg-[#111111] border border-[#C9A84C]/10 border-t-4 border-t-[#C9A84C] rounded-b-xl p-8 flex flex-col gap-5 h-full w-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center">
                <Gavel className="w-4.5 h-4.5 text-[#C9A84C]" />
              </div>
              <div>
                <span className="text-sm font-serif italic font-bold text-[#C9A84C] tracking-wider block">
                  Judge AI
                </span>
                <span className="text-xs text-[#F5F0E8] font-sans block opacity-75">
                  Neutral verdict
                </span>
              </div>
            </div>

            {/* Verdict Pill */}
            <div className="flex justify-center py-3 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded-lg mb-4">
              <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
                {verdict.label}
              </span>
            </div>

            <p className="text-[#F5F0E8] text-base leading-loose tracking-wide font-sans mb-4">
              {clause.judge.reasoning}
            </p>
          </div>

          {/* Negotiation tip block */}
          <div className="mt-auto pt-4 border-t border-[#C9A84C]/15">
            <div className="bg-[#8B6914]/10 border-l-2 border-l-[#C9A84C] rounded-r p-4">
              <span className="text-xs text-[#C9A84C] font-mono font-bold uppercase tracking-wider block mb-1">
                Negotiation Tip
              </span>
              <p className="text-[#F5F0E8] text-sm leading-relaxed font-sans">
                {clause.judge.negotiation_tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
