import { motion } from 'framer-motion'
import { Clock, TrendingUp, AlertTriangle, Minus } from 'lucide-react'
import type { Timeline } from '../types'

interface Props {
  timeline: Timeline
}

const MONTH_LABELS: Record<number, string> = {
  0: 'Day One',
  3: '3 Months',
  6: '6 Months',
  12: '1 Year',
  24: '2 Years',
}

const timelineContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
}

const milestoneVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function TimeMachine({ timeline }: Props) {
  const events = [...(timeline.events ?? [])].sort((a, b) => a.month - b.month)

  return (
    <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-6 shadow-md relative">
      
      {/* Decorative corner accents */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#C9A84C]/20" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C9A84C]/20" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#C9A84C]/20" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#C9A84C]/20" />

      {/* 🕒 Title Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#C9A84C]/10">
        <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#C9A84C]/25 flex items-center justify-center shadow-gold-soft">
          <Clock className="w-4.5 h-4.5 text-[#C9A84C]" />
        </div>
        <div>
          <h4 className="font-serif italic text-base text-white font-semibold">
            🕒 Contract Time Machine
          </h4>
          <p className="text-[#8A8070] text-[10px] font-sans">
            What happens after you sign this clause
          </p>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Wrapper */}
      <div className="relative mb-8 w-full">
        {/* Faint gold horizontal connecting guide line */}
        <div className="absolute top-[40px] left-6 right-6 h-[1px] bg-[#C9A84C]/25 z-0" />

        <motion.div
          variants={timelineContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          className="flex overflow-x-auto gap-6 pb-4 pt-2 relative z-10 scrollbar-hide cursor-grab active:cursor-grabbing w-full"
        >
          {events.map((ev, i) => (
            <motion.div
              key={i}
              variants={milestoneVariants}
              className="bg-[#0A0A0A] border border-[#C9A84C]/15 rounded-xl p-5 min-w-[260px] max-w-[280px] shadow-sm flex flex-col gap-3 relative shrink-0"
            >
              {/* Connecting point dot on top line */}
              <div className="absolute -top-[16px] left-[50%] -translate-x-[50%] w-3 h-3 rounded-full border border-[#C9A84C] bg-[#111111] z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
              </div>

              {/* Month Big Label */}
              <div className="flex items-baseline justify-between border-b border-[#C9A84C]/10 pb-2">
                <span className="font-cinzel text-base font-bold text-[#C9A84C] tracking-widest uppercase">
                  Month {ev.month}
                </span>
                <span className="text-[9px] text-[#8A8070] font-mono uppercase font-semibold">
                  {MONTH_LABELS[ev.month] ?? `M+${ev.month}`}
                </span>
              </div>

              {/* Event Description */}
              <p className="text-[#F5F0E8] text-xs leading-relaxed font-sans min-h-[50px]">
                {ev.event}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 3 Scenario Cards: Best, Realistic, Worst */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-[#C9A84C]/10">
        
        {/* BEST CASE: forest green left border + green tinted background */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#2C4A2E]/5 border border-[#C9A84C]/10 border-l-4 border-l-[#2C4A2E] rounded-r-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-serif italic font-bold text-emerald-400 tracking-wider">
              Best Case Scenario
            </span>
          </div>
          <p className="text-[#F5F0E8] text-xs leading-relaxed">
            {timeline.scenario_best}
          </p>
        </motion.div>

        {/* REALISTIC: amber left border + amber tinted background */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#8B6914]/5 border border-[#C9A84C]/10 border-l-4 border-l-[#C9A84C] rounded-r-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-serif italic font-bold text-[#C9A84C] tracking-wider">
              Realistic Scenario
            </span>
          </div>
          <p className="text-[#F5F0E8] text-xs leading-relaxed">
            {timeline.scenario_realistic}
          </p>
        </motion.div>

        {/* WORST CASE: crimson left border + crimson tinted background */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#8B0000]/5 border border-[#C9A84C]/10 border-l-4 border-l-[#8B0000] rounded-r-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-serif italic font-bold text-red-400 tracking-wider">
              Worst Case Scenario
            </span>
          </div>
          <p className="text-[#F5F0E8] text-xs leading-relaxed">
            {timeline.scenario_worst}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
