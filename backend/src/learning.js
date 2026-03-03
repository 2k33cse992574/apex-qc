import { nowIso } from "./utils.js"

export function derivePolicyUpdate(input, kpis, currentPolicy) {
  const shouldEnableIplPreActivation =
    input.eventTag?.toLowerCase().includes("ipl") && kpis.impact.delayReducedPercent >= 50

  if (!shouldEnableIplPreActivation) {
    return {
      updated: false,
      reason: "No policy trigger hit",
      nextPolicy: currentPolicy,
    }
  }

  return {
    updated: true,
    reason: "High-impact IPL incident detected",
    nextPolicy: {
      ...currentPolicy,
      updatedAt: nowIso(),
      rules: {
        ...currentPolicy.rules,
        preActivateRidersForIpl: true,
        preActivationHourLocal: "20:00",
      },
    },
  }
}
