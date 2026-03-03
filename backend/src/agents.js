import { clamp, round } from "./utils.js"

function demandAgent(input) {
  const spike = input.demandSpikePercent
  const peakMins = clamp(Math.round(30 - spike / 40), 8, 35)
  const tailMins = peakMins + clamp(Math.round(spike / 12), 18, 60)
  const confidence = clamp(0.7 + spike / 1000, 0.72, 0.96)
  return {
    domain: "demand",
    confidence,
    summary: `Peak in ~${peakMins} min, tail in ~${tailMins} min`,
    recommendation: {
      forecastPeakMinutes: peakMins,
      forecastTailMinutes: tailMins,
      prepWindowMinutes: clamp(peakMins - 6, 2, 15),
    },
  }
}

function inventoryAgent(input) {
  const depletion = input.stockDepletionPercent
  const transferable = depletion > 75
  const candidateStore = transferable ? "Store 4 (Goregaon)" : null
  const confidence = clamp(0.66 + depletion / 450, 0.7, 0.94)
  return {
    domain: "inventory",
    confidence,
    summary: transferable
      ? `${candidateStore} has surplus; transfer viable`
      : "No major surplus detected; local restock only",
    recommendation: {
      transferEnabled: transferable,
      sourceStore: candidateStore,
      transferUnits: transferable ? Math.round(depletion * 1.8) : 0,
      restockPriority: depletion > 90 ? "critical" : "high",
    },
  }
}

function logisticsAgent(input) {
  const riderGap = Math.max(input.ridersNeeded - input.ridersAvailable, 0)
  const pressure = clamp((input.storeCapacityPercent + riderGap * 2) / 120, 0, 1)
  const reroutePercent = clamp(Math.round(pressure * 38), 8, 40)
  const etaIncreaseMinutes = clamp(Math.round(pressure * 6), 1, 7)
  const confidence = clamp(0.68 + pressure * 0.28, 0.72, 0.96)
  return {
    domain: "logistics",
    confidence,
    summary: `Reroute ${reroutePercent}% orders, ETA +${etaIncreaseMinutes} min`,
    recommendation: {
      reroutePercent,
      etaIncreaseMinutes,
      riderGap,
      suggestedRiderIncentiveInr: riderGap > 0 ? 40 : 0,
    },
  }
}

function pricingAgent(input) {
  const marginGap = Math.max(5 - input.marginPercent, 0)
  const demandFactor = clamp(input.demandSpikePercent / 350, 0, 1.3)
  const beverageSurgePercent = clamp(Math.round(marginGap * 2 + demandFactor * 4), 2, 14)
  const chipsSurgePercent = clamp(Math.round(beverageSurgePercent * 0.55), 1, 9)
  const confidence = clamp(0.65 + demandFactor * 0.2, 0.7, 0.93)
  return {
    domain: "pricing",
    confidence,
    summary: `Apply beverages +${beverageSurgePercent}%, chips +${chipsSurgePercent}%`,
    recommendation: {
      beverageSurgePercent,
      chipsSurgePercent,
      reason: marginGap > 0 ? "margin-rescue" : "demand-balance",
    },
  }
}

function riskAgent(input) {
  const etaRisk = clamp(input.storeCapacityPercent / 100, 0.2, 0.95)
  const churnRiskPercent = clamp(Math.round(etaRisk * 26), 7, 34)
  const confidence = clamp(0.73 + etaRisk * 0.17, 0.75, 0.95)
  return {
    domain: "risk",
    confidence,
    summary: `Churn risk ${churnRiskPercent}% if delay messaging is late`,
    recommendation: {
      churnRiskPercent,
      proactiveDelayMessage: churnRiskPercent >= 20,
      messageLeadTimeMinutes: churnRiskPercent >= 20 ? 4 : 2,
    },
  }
}

export function runDomainAgents(input) {
  return [demandAgent(input), inventoryAgent(input), logisticsAgent(input), pricingAgent(input), riskAgent(input)]
}

export function runWorkerAgents(domainResults) {
  const demand = domainResults.find((d) => d.domain === "demand").recommendation
  const inventory = domainResults.find((d) => d.domain === "inventory").recommendation
  const logistics = domainResults.find((d) => d.domain === "logistics").recommendation
  const pricing = domainResults.find((d) => d.domain === "pricing").recommendation
  const risk = domainResults.find((d) => d.domain === "risk").recommendation

  return [
    { worker: "forecast", value: demand.forecastPeakMinutes, unit: "minutes" },
    { worker: "surplus_scan", value: inventory.transferUnits, unit: "units" },
    { worker: "route_opt", value: logistics.reroutePercent, unit: "percent" },
    { worker: "surge_calc", value: pricing.beverageSurgePercent, unit: "percent" },
    { worker: "eta", value: logistics.etaIncreaseMinutes, unit: "minutes" },
    { worker: "rider_incentive", value: logistics.suggestedRiderIncentiveInr, unit: "inr" },
    { worker: "restock_alert", value: inventory.restockPriority, unit: "priority" },
    { worker: "churn_risk", value: risk.churnRiskPercent, unit: "percent" },
    { worker: "margin", value: round(5 + pricing.beverageSurgePercent / 3.5), unit: "percent" },
    { worker: "cx_score", value: clamp(100 - risk.churnRiskPercent + 8, 35, 95), unit: "score" },
  ]
}

export function runAggregatorAgents(domainResults, workerResults) {
  const pricing = domainResults.find((d) => d.domain === "pricing").recommendation
  const risk = domainResults.find((d) => d.domain === "risk").recommendation
  const logistics = domainResults.find((d) => d.domain === "logistics").recommendation

  const conflictResolved =
    pricing.beverageSurgePercent > 8 && risk.churnRiskPercent > 20
      ? "Pricing-Risk conflict resolved via capped surge + proactive messaging"
      : "No major cross-domain conflict"

  const guardrailScore = clamp(
    (domainResults.reduce((sum, d) => sum + d.confidence, 0) / domainResults.length) * 100,
    70,
    99
  )

  return {
    conflictResolver: {
      status: "ok",
      summary: conflictResolved,
    },
    costCheck: {
      reroutePercent: logistics.reroutePercent,
      riderIncentiveInr: workerResults.find((w) => w.worker === "rider_incentive").value,
    },
    guardrail: {
      preCheckScore: round(guardrailScore, 1),
    },
    ranking: domainResults
      .map((d) => ({ domain: d.domain, confidence: round(d.confidence, 3) }))
      .sort((a, b) => b.confidence - a.confidence),
    compressedNarrative: domainResults.map((d) => d.summary).join(" | "),
  }
}
