import { motion } from 'framer-motion'
import { Shield, Scale, Gavel, AlertTriangle, Info, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import type { Clause, RiskLevel, Verdict } from '../types'

interface Props {
  clause: Clause
}

function riskConfig(level: RiskLevel) {
  switch (level) {
    case 'HIGH':   return { badge: 'badge-high',   dot: 'bg-red-400',   label: 'High Risk',   Icon: AlertTriangle }
    case 'MEDIUM': return { badge: 'badge-medium', dot: 'bg-amber-400', label: 'Medium Risk', Icon: Info          }
    case 'LOW':    return { badge: 'badge-low',    dot: 'bg-emerald-400',label: 'Low Risk',   Icon: CheckCircle2  }
  }
}

function verdictConfig(verdict: Verdict) {
  switch (verdict) {
    case 'REJECT':    return { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     Icon: XCircle,      label: 'REJECT'    }
    case 'NEGOTIATE': return { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   Icon: MinusCircle,  label: 'NEGOTIATE' }
    case 'ACCEPT':    return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', Icon: CheckCircle2, label: 'ACCEPT'    }
  }
}

function clauseTypeLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export default function CourtroomPanel({ clause }: Props) {
  const risk    = riskConfig(clause.risk_level)
  const verdict = verdictConfig(clause.judge.verdict)
  const RiskIcon    = risk.Icon
  const VerdictIcon = verdict.Icon

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="glass-card p-6 mb-4"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {/* Clause type pill */}
            <span className="text-xs font-mono font-medium text-accent-light bg-accent/10
                             border border-accent/20 rounded-full px-3 py-0.5">
              {clauseTypeLabel(clause.type)}
            </span>
            {/* Clause ID */}
            <span className="text-xs text-slate-600 font-mono">{clause.clause_id}</span>
          </div>

          {/* Risk badge */}
          <div className={risk.badge}>
            <RiskIcon className="w-3 h-3" />
            {risk.label}
          </div>
        </div>

        {/* Verdict chip */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold
                         uppercase tracking-wider border ${verdict.color} ${verdict.bg} ${verdict.border}`}>
          <VerdictIcon className="w-3.5 h-3.5" />
          {verdict.label}
        </div>
      </div>

      {/* Clause text excerpt */}
      <div className="bg-[#0A0E1A] border border-[#1E2A45] rounded-lg px-4 py-3 mb-6">
        <p className="text-slate-400 text-sm leading-relaxed font-mono line-clamp-4">
          {clause.text}
        </p>
      </div>

      {/* Three agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Defender */}
        <div className="bg-[#0F1629] border border-[#1E2A45] agent-defender rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Defender</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed flex-1">
            {clause.defender.argument}
          </p>
        </div>

        {/* Prosecutor */}
        <div className="bg-[#0F1629] border border-[#1E2A45] agent-prosecutor rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-accent-light" />
            </div>
            <span className="text-xs font-bold text-accent-light uppercase tracking-wider">Prosecutor</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed flex-1">
            {clause.prosecutor.argument}
          </p>
        </div>

        {/* Judge */}
        <div className="bg-[#0F1629] border border-[#1E2A45] agent-judge rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Gavel className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Judge</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed flex-1">
            {clause.judge.reasoning}
          </p>
          {/* Negotiation tip */}
          <div className="mt-auto pt-3 border-t border-[#1E2A45]">
            <p className="text-[10px] text-emerald-500/70 font-semibold uppercase tracking-wider mb-1">
              Negotiation Tip
            </p>
            <p className="text-emerald-300/80 text-xs leading-relaxed">
              {clause.judge.negotiation_tip}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
