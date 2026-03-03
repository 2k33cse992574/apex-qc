export const GUARDRAILS = {
  minConfidence: 0.78,
  maxSurgePercent: 12,
  maxReroutePercent: 40,
  overrideWindowSec: 30,
}

export const ORCHESTRATOR = {
  criticalThreshold: 8,
  timeBudgetSec: 8,
}

export const DEFAULT_POLICY = {
  id: "policy_default_qc_001",
  name: "Baseline Quick Commerce Policy",
  updatedAt: new Date().toISOString(),
  rules: {
    preActivateRidersForIpl: false,
    preActivationHourLocal: "20:00",
    maxSurgePercent: GUARDRAILS.maxSurgePercent,
    maxReroutePercent: GUARDRAILS.maxReroutePercent,
    confidenceThreshold: GUARDRAILS.minConfidence,
  },
}
