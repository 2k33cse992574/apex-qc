export type DomainResult = {
  domain: "demand" | "inventory" | "logistics" | "pricing" | "risk"
  confidence: number
  summary: string
  recommendation: Record<string, unknown>
}

export type IncidentRecord = {
  id: string
  startedAt: string
  completedAt: string
  orchestrator: {
    severity: number
    priority: "CRITICAL" | "HIGH"
    timeBudgetSec: number
    activatedDomains: string[]
    reasoning?: {
      provider: string
      modelId: string
      fallback: boolean
      fallbackReason?: string
    }
  }
  input: {
    city: string
    zone: string
    eventTag: string
    demandSpikePercent: number
    stockDepletionPercent: number
    storeCapacityPercent: number
    ridersAvailable: number
    ridersNeeded: number
    marginPercent: number
  }
  domainResults: DomainResult[]
  workerResults: Array<{ worker: string; value: number | string; unit: string }>
  fusionDecision: {
    actions: Array<{ action: string; execute: boolean; payload: Record<string, unknown> }>
    executedCount: number
  }
  kpis: {
    before: { marginPercent: number }
    after: { marginPercent: number }
    impact: {
      delayReducedPercent: number
      cancellationsReducedPercent: number
      revenueImpactInr: number
    }
  }
  learning: {
    policyUpdated: boolean
    reason: string
    policy: Policy
  }
}

export type Policy = {
  id: string
  name: string
  updatedAt: string
  rules: {
    preActivateRidersForIpl: boolean
    preActivationHourLocal: string
    maxSurgePercent: number
    maxReroutePercent: number
    confidenceThreshold: number
  }
}

export type KpiSnapshot = {
  incidentId: string
  timestamp: string
  severity: number
  priority: "CRITICAL" | "HIGH"
  delayReducedPercent: number
  cancellationsReducedPercent: number
  revenueImpactInr: number
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "http://localhost:8080"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `API error ${res.status}`)
  }
  return (await res.json()) as T
}

export async function getHealth() {
  return request<{
    service: string
    status: string
    now: string
    uptimeSec: number
    agenticCategory: string
    reasoningModel: string
  }>("/api/health")
}

export async function simulateIncident(input?: Partial<IncidentRecord["input"]>) {
  return request<IncidentRecord>("/api/incidents/simulate", {
    method: "POST",
    body: JSON.stringify({ input }),
  })
}

export async function listIncidents(limit = 25) {
  return request<{ incidents: IncidentRecord[] }>(`/api/incidents?limit=${limit}`)
}

export async function getCurrentPolicy() {
  return request<{ policy: Policy }>("/api/policies/current")
}

export async function listKpis(limit = 25) {
  return request<{ snapshots: KpiSnapshot[] }>(`/api/kpis?limit=${limit}`)
}
