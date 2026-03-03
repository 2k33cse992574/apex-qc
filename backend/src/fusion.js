import { GUARDRAILS } from "./config.js"
import { clamp, round } from "./utils.js"

export function applyGuardrails(domainResults) {
  const outcomes = []
  const blocked = []

  for (const result of domainResults) {
    if (result.confidence < GUARDRAILS.minConfidence) {
      blocked.push({
        domain: result.domain,
        reason: `confidence_below_threshold (${round(result.confidence, 2)} < ${GUARDRAILS.minConfidence})`,
      })
      continue
    }

    outcomes.push(result)
  }

  return { outcomes, blocked }
}

export function buildActionPlan(approvedResults) {
  const get = (domain) => approvedResults.find((item) => item.domain === domain)?.recommendation
  const inventory = get("inventory")
  const logistics = get("logistics")
  const pricing = get("pricing")
  const risk = get("risk")

  const reroutePercent = clamp(logistics?.reroutePercent ?? 0, 0, GUARDRAILS.maxReroutePercent)
  const beverageSurgePercent = clamp(pricing?.beverageSurgePercent ?? 0, 0, GUARDRAILS.maxSurgePercent)
  const chipsSurgePercent = clamp(pricing?.chipsSurgePercent ?? 0, 0, GUARDRAILS.maxSurgePercent)

  return [
    {
      action: "reroute_orders",
      execute: reroutePercent > 0,
      payload: {
        percent: reroutePercent,
        source: "hot-zone",
        target: inventory?.sourceStore ?? "nearest-surplus-store",
      },
    },
    {
      action: "apply_surge_pricing",
      execute: beverageSurgePercent > 0 || chipsSurgePercent > 0,
      payload: {
        beveragesPercent: beverageSurgePercent,
        chipsPercent: chipsSurgePercent,
        capPercent: GUARDRAILS.maxSurgePercent,
      },
    },
    {
      action: "trigger_rider_incentive",
      execute: (logistics?.suggestedRiderIncentiveInr ?? 0) > 0,
      payload: {
        amountInr: logistics?.suggestedRiderIncentiveInr ?? 0,
        zone: "surge-zone",
      },
    },
    {
      action: "send_restock_alert",
      execute: (inventory?.transferEnabled ?? false) || (inventory?.restockPriority === "critical"),
      payload: {
        priority: inventory?.restockPriority ?? "high",
        transferUnits: inventory?.transferUnits ?? 0,
      },
    },
    {
      action: "notify_customers",
      execute: risk?.proactiveDelayMessage ?? false,
      payload: {
        channel: "sms",
        template: "delay_proactive_eta",
        leadTimeMinutes: risk?.messageLeadTimeMinutes ?? 2,
      },
    },
  ]
}

export function computeKpis(input, actionPlan) {
  const activeActions = actionPlan.filter((a) => a.execute).length
  const delayReducedPercent = clamp(20 + activeActions * 9, 12, 75)
  const cancellationsReducedPercent = clamp(10 + activeActions * 6, 5, 50)
  const marginAfterPercent = round(input.marginPercent + activeActions * 0.34, 2)
  const revenueImpactInr = Math.round((delayReducedPercent + cancellationsReducedPercent) * 1200)

  return {
    before: {
      marginPercent: input.marginPercent,
    },
    after: {
      marginPercent: marginAfterPercent,
    },
    impact: {
      delayReducedPercent,
      cancellationsReducedPercent,
      revenueImpactInr,
    },
  }
}
