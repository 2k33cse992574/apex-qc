import crypto from "node:crypto"

export function nowIso() {
  return new Date().toISOString()
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().split("-")[0]}`
}

export function round(value, digits = 2) {
  const multiplier = 10 ** digits
  return Math.round(value * multiplier) / multiplier
}

export function safeJsonParse(body, fallback = null) {
  try {
    return JSON.parse(body)
  } catch {
    return fallback
  }
}
