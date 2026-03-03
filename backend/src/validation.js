import { clamp } from "./utils.js"

const TEXT_LIMIT = 120

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
}

function normalizeText(value, fallback) {
  if (typeof value !== "string") {
    return fallback
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return fallback
  }
  return trimmed.slice(0, TEXT_LIMIT)
}

export function normalizeIncidentInput(rawInput, defaults) {
  const input = { ...defaults, ...(rawInput || {}) }
  const errors = []

  const demandSpikePercent = Number(input.demandSpikePercent)
  const stockDepletionPercent = Number(input.stockDepletionPercent)
  const storeCapacityPercent = Number(input.storeCapacityPercent)
  const ridersAvailable = Number(input.ridersAvailable)
  const ridersNeeded = Number(input.ridersNeeded)
  const marginPercent = Number(input.marginPercent)

  if (!isFiniteNumber(demandSpikePercent) || demandSpikePercent < 0 || demandSpikePercent > 1200) {
    errors.push("demandSpikePercent must be a number between 0 and 1200")
  }
  if (!isFiniteNumber(stockDepletionPercent) || stockDepletionPercent < 0 || stockDepletionPercent > 100) {
    errors.push("stockDepletionPercent must be a number between 0 and 100")
  }
  if (!isFiniteNumber(storeCapacityPercent) || storeCapacityPercent < 0 || storeCapacityPercent > 100) {
    errors.push("storeCapacityPercent must be a number between 0 and 100")
  }
  if (!isFiniteNumber(ridersAvailable) || ridersAvailable < 0 || ridersAvailable > 5000) {
    errors.push("ridersAvailable must be a number between 0 and 5000")
  }
  if (!isFiniteNumber(ridersNeeded) || ridersNeeded < 0 || ridersNeeded > 5000) {
    errors.push("ridersNeeded must be a number between 0 and 5000")
  }
  if (!isFiniteNumber(marginPercent) || marginPercent < -20 || marginPercent > 60) {
    errors.push("marginPercent must be a number between -20 and 60")
  }
  if (isFiniteNumber(ridersAvailable) && isFiniteNumber(ridersNeeded) && ridersNeeded < ridersAvailable) {
    errors.push("ridersNeeded should be greater than or equal to ridersAvailable")
  }

  const normalized = {
    city: normalizeText(input.city, defaults.city),
    zone: normalizeText(input.zone, defaults.zone),
    timestamp: normalizeText(input.timestamp, defaults.timestamp),
    eventTag: normalizeText(input.eventTag, defaults.eventTag),
    demandSpikePercent: clamp(demandSpikePercent, 0, 1200),
    stockDepletionPercent: clamp(stockDepletionPercent, 0, 100),
    storeCapacityPercent: clamp(storeCapacityPercent, 0, 100),
    ridersAvailable: clamp(Math.round(ridersAvailable), 0, 5000),
    ridersNeeded: clamp(Math.round(ridersNeeded), 0, 5000),
    marginPercent: clamp(marginPercent, -20, 60),
  }

  return { valid: errors.length === 0, errors, input: normalized }
}

export function parseLimit(limitRaw, fallback = 25, max = 200) {
  const parsed = Number(limitRaw)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return clamp(Math.round(parsed), 1, max)
}
