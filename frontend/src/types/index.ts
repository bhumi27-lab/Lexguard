export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type Verdict  = 'REJECT' | 'ACCEPT' | 'NEGOTIATE'

export interface TimelineEvent {
  month: number
  event: string
}

export interface Timeline {
  events: TimelineEvent[]
  scenario_best: string
  scenario_realistic: string
  scenario_worst: string
}

export interface Clause {
  clause_id: string
  text: string
  type: string
  risk_level: RiskLevel
  defender:   { argument: string }
  prosecutor: { argument: string }
  judge: {
    verdict: Verdict
    reasoning: string
    negotiation_tip: string
  }
  timeline: Timeline
}

export interface AnalysisResult {
  clauses: Clause[]
  overall_risk: RiskLevel
  total_clauses_found: number
}
