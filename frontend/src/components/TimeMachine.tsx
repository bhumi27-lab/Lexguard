import { motion } from 'framer-motion'
import { Clock, TrendingUp, AlertTriangle, Minus } from 'lucide-react'
import type { Timeline } from '../types'

interface Props {
  timeline: Timeline
}

const MONTH_LABELS: Record<number, string> = {
  0:  'Day One',
  3:  '3 Months',
  6:  '6 Months',
  12: '1 Year',
  24: '2 Years',
}

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.3 } },
}

const itemVariants = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const scenarioCards = [
  {
    key:   'scenario_best' as const,
    label: 'Best Case',
    Icon:  TrendingUp,
    color: 'text-emerald-400',
    bg:    'bg-emerald-500/8',
    border:'border-emerald-500/25',
    dot:   'bg-emerald-400',
  },
  {
    key:   'scenario_realistic' as const,
    label: 'Realistic',
    Icon:  Minus,
    color: 'text-amber-400',
    bg:    'bg-amber-500/8',
    border:'border-amber-500/25',
    dot:   'bg-amber-400',
  },
  {
    key:   'scenario_worst' as const,
    label: 'Worst Case',
    Icon:  AlertTriangle,
    color: 'text-red-400',
    bg:    'bg-red-500/8',
    border:'border-red-500/25',
    dot:   'bg-red-400',
  },
]

export default function TimeMachine({ timeline }: Props) {
  const events = [...(timeline.events ?? [])].sort((a, b) => a.month - b.month)

  return (
    <div className="glass-card p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
          <Clock className="w-4.5 h-4.5 text-accent-light" style={{ width: '18px', height: '18px' }} />
        </div>
        <div>
          <h3 className="text-white font-bold text-base tracking-tight">Contract Time Machine</h3>
          <p className="text-slate-500 text-xs">Month-by-month consequence forecast</p>
        </div>
      </div>

      {/* Vertical timeline */}
      <motion.ol
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        className="relative pl-6 border-l border-[#1E2A45] space-y-6 mb-8"
      >
        {events.map((ev, i) => (
          <motion.li key={i} variants={itemVariants} className="relative">
            {/* Dot on the line */}
            <span
              className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-accent bg-background"
              style={{ left: '-25px' }}
            />

            {/* Month label */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-accent-light text-xs font-bold font-mono uppercase tracking-widest">
                {MONTH_LABELS[ev.month] ?? `Month ${ev.month}`}
              </span>
              <span className="text-slate-700 text-[10px] font-mono">·</span>
              <span className="text-slate-600 text-[10px] font-mono">M+{ev.month}</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">{ev.event}</p>
          </motion.li>
        ))}
      </motion.ol>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarioCards.map(({ key, label, Icon, color, bg, border, dot }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className={`rounded-xl p-4 border ${bg} ${border} flex flex-col gap-2`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{timeline[key]}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
