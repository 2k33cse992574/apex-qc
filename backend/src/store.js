import { DEFAULT_POLICY } from "./config.js"

const incidents = []
const kpiSnapshots = []
const pendingOverrides = []
let policy = { ...DEFAULT_POLICY }
const MAX_INCIDENTS = 500
const MAX_KPIS = 1000
const MAX_PENDING = 250

function trim(list, maxItems) {
  if (list.length > maxItems) {
    list.length = maxItems
  }
}

export function saveIncident(incidentRecord) {
  incidents.unshift(incidentRecord)
  trim(incidents, MAX_INCIDENTS)
}

export function listIncidents(limit = 25) {
  return incidents.slice(0, limit)
}

export function getIncidentById(id) {
  return incidents.find((item) => item.id === id) || null
}

export function saveKpiSnapshot(snapshot) {
  kpiSnapshots.unshift(snapshot)
  trim(kpiSnapshots, MAX_KPIS)
}

export function listKpiSnapshots(limit = 25) {
  return kpiSnapshots.slice(0, limit)
}

export function getPolicy() {
  return policy
}

export function updatePolicy(nextPolicy) {
  policy = { ...policy, ...nextPolicy, rules: { ...policy.rules, ...nextPolicy.rules } }
  return policy
}

export function savePendingOverride(overrideRecord) {
  pendingOverrides.unshift(overrideRecord)
  trim(pendingOverrides, MAX_PENDING)
  return overrideRecord
}

export function listPendingOverrides() {
  const now = Date.now()
  return pendingOverrides.filter((item) => item.status === "PENDING" && Date.parse(item.expiresAt) > now)
}

export function resolvePendingOverride(overrideId, decision, reviewer = "ops_manager") {
  const target = pendingOverrides.find((item) => item.id === overrideId)
  if (!target) {
    return null
  }
  if (target.status !== "PENDING") {
    return target
  }
  if (Date.parse(target.expiresAt) <= Date.now()) {
    target.status = "EXPIRED"
    target.reviewedBy = reviewer
    target.reviewedAt = new Date().toISOString()
    return target
  }

  target.status = decision === "APPROVE" ? "APPROVED" : "REJECTED"
  target.reviewedBy = reviewer
  target.reviewedAt = new Date().toISOString()

  const incident = incidents.find((item) => item.id === target.incidentId)
  if (incident) {
    incident.fusionDecision = {
      ...incident.fusionDecision,
      executionStatus: target.status,
      executedCount: decision === "APPROVE" ? incident.fusionDecision.plannedCount : 0,
      actionPlan: incident.fusionDecision.actionPlan.map((action) => ({
        ...action,
        execute: decision === "APPROVE" ? action.execute : false,
      })),
    }
  }

  return target
}

export function getStoreStats() {
  return {
    incidents: incidents.length,
    kpiSnapshots: kpiSnapshots.length,
    pendingOverrides: listPendingOverrides().length,
    policyUpdatedAt: policy.updatedAt,
  }
}

export function resetStore() {
  incidents.length = 0
  kpiSnapshots.length = 0
  pendingOverrides.length = 0
  policy = { ...DEFAULT_POLICY }
  return getStoreStats()
}
