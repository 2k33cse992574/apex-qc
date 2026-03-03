import { GUARDRAILS, ORCHESTRATOR } from "./config.js"
import { runAggregatorAgents, runWorkerAgents } from "./agents.js"
import { applyGuardrails, buildActionPlan, computeKpis } from "./fusion.js"
import { derivePolicyUpdate } from "./learning.js"
import { resolveDomainResults } from "./reasoning-provider.js"
import { getPolicy, saveIncident, saveKpiSnapshot, savePendingOverride, updatePolicy } from "./store.js"
import { createId, nowIso, round } from "./utils.js"

export function defaultIncidentInput() {
  return {
    city: "Mumbai",
    zone: "Andheri",
    timestamp: nowIso(),
    eventTag: "IPL match night",
    demandSpikePercent: 340,
    stockDepletionPercent: 94,
    storeCapacityPercent: 89,
    ridersAvailable: 4,
    ridersNeeded: 22,
    marginPercent: 3.1,
  }
}

function computeSeverity(input) {
  const demandScore = input.demandSpikePercent / 60
  const stockScore = input.stockDepletionPercent / 20
  const capacityScore = input.storeCapacityPercent / 25
  const riderGap = Math.max(input.ridersNeeded - input.ridersAvailable, 0)
  const riderScore = riderGap / 5
  const marginScore = Math.max(5 - input.marginPercent, 0) / 1.4
  return round(Math.min((demandScore + stockScore + capacityScore + riderScore + marginScore) / 2.3, 10), 1)
}

export async function runIncidentLifecycle(input = defaultIncidentInput(), options = {}) {
  const startedAt = nowIso()
  const incidentId = createId("inc")
  const holdForOverride = options.holdForOverride === true
  const severity = computeSeverity(input)
  const priority = severity >= ORCHESTRATOR.criticalThreshold ? "CRITICAL" : "HIGH"

  const resolved = await resolveDomainResults(input)
  const domainResults = resolved.domainResults
  const workerResults = runWorkerAgents(domainResults)
  const aggregatorResults = runAggregatorAgents(domainResults, workerResults)
  const guardrails = applyGuardrails(domainResults)
  const actions = buildActionPlan(guardrails.outcomes)
  const kpis = computeKpis(input, actions)
  const currentPolicy = getPolicy()
  const policyOutcome = derivePolicyUpdate(input, kpis, currentPolicy)
  const plannedCount = actions.filter((a) => a.execute).length
  const overrideId = holdForOverride ? createId("ovr") : null
  const overrideExpiresAt = holdForOverride
    ? new Date(Date.now() + GUARDRAILS.overrideWindowSec * 1000).toISOString()
    : null

  if (policyOutcome.updated) {
    updatePolicy(policyOutcome.nextPolicy)
  }

  const record = {
    id: incidentId,
    startedAt,
    completedAt: nowIso(),
    orchestrator: {
      severity,
      priority,
      timeBudgetSec: ORCHESTRATOR.timeBudgetSec,
      activatedDomains: domainResults.map((d) => d.domain),
      reasoning: resolved.reasoning,
    },
    input,
    domainResults,
    workerResults,
    aggregatorResults,
    guardrails,
    fusionDecision: {
      actionPlan: actions,
      actions,
      plannedCount,
      executedCount: holdForOverride ? 0 : plannedCount,
      executionStatus: holdForOverride ? "PENDING_OVERRIDE" : "EXECUTED",
      blockedAgents: guardrails.blocked,
      override: holdForOverride
        ? {
            id: overrideId,
            expiresAt: overrideExpiresAt,
            windowSec: GUARDRAILS.overrideWindowSec,
          }
        : null,
    },
    kpis,
    learning: {
      policyUpdated: policyOutcome.updated,
      reason: policyOutcome.reason,
      policy: policyOutcome.updated ? policyOutcome.nextPolicy : currentPolicy,
    },
  }

  saveIncident(record)
  if (holdForOverride) {
    savePendingOverride({
      id: overrideId,
      incidentId: record.id,
      createdAt: record.completedAt,
      expiresAt: overrideExpiresAt,
      status: "PENDING",
      actionCount: plannedCount,
    })
  }
  saveKpiSnapshot({
    incidentId,
    timestamp: record.completedAt,
    severity,
    priority,
    ...kpis.impact,
  })

  return record
}
