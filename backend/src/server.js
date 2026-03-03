import "./env.js"
import http from "node:http"
import {
  getPolicy,
  listIncidents,
  listKpiSnapshots,
  getIncidentById,
  getStoreStats,
  listPendingOverrides,
  resetStore,
  resolvePendingOverride,
} from "./store.js"
import { runIncidentLifecycle, defaultIncidentInput } from "./orchestrator.js"
import { reasoningRuntimeStatus } from "./reasoning-provider.js"
import { safeJsonParse } from "./utils.js"
import { normalizeIncidentInput, parseLimit } from "./validation.js"

const PORT = Number(process.env.PORT || 8080)

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
  res.end(JSON.stringify(payload))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk
    })
    req.on("end", () => resolve(body))
    req.on("error", () => resolve(""))
  })
}

function routeNotFound(res) {
  sendJson(res, 404, {
    error: "not_found",
    message: "Route not found",
  })
}

function sendError(res, statusCode, code, message, details) {
  return sendJson(res, statusCode, {
    error: code,
    message,
    ...(details ? { details } : {}),
  })
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      return routeNotFound(res)
    }

    const url = new URL(req.url, `http://localhost:${PORT}`)
    const pathname = url.pathname
    const method = req.method.toUpperCase()

    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      })
      res.end()
      return
    }

    if (pathname === "/api/health" && method === "GET") {
      const reasoning = reasoningRuntimeStatus()
      return sendJson(res, 200, {
        service: "apex-qc-backend",
        status: "ok",
        agenticCategory: "Agentic AI",
        reasoningModel:
          reasoning.provider === "bedrock"
            ? `Amazon Nova via Bedrock (${reasoning.modelId})`
            : "Local simulator (set REASONING_PROVIDER=bedrock for live Nova)",
        reasoningRuntime: reasoning,
        store: getStoreStats(),
        uptimeSec: Math.round(process.uptime()),
        now: new Date().toISOString(),
      })
    }

    if (pathname === "/api/incidents/simulate" && method === "POST") {
      const raw = await readBody(req)
      const payload = safeJsonParse(raw, null)
      if (payload === null || typeof payload !== "object") {
        return sendError(res, 400, "invalid_json", "Request body must be valid JSON object")
      }

      const normalized = normalizeIncidentInput(payload.input, defaultIncidentInput())
      if (!normalized.valid) {
        return sendError(res, 400, "invalid_incident_input", "Incident input validation failed", normalized.errors)
      }

      const holdForOverride = url.searchParams.get("hold") === "true"
      const record = await runIncidentLifecycle(normalized.input, { holdForOverride })
      return sendJson(res, 201, record)
    }

    if (pathname === "/api/runtime/reasoning" && method === "GET") {
      return sendJson(res, 200, {
        reasoning: reasoningRuntimeStatus(),
        note:
          "Set REASONING_PROVIDER=bedrock and AWS credentials/region to enable live Amazon Nova calls.",
      })
    }

    if (pathname === "/api/summary" && method === "GET") {
      const incidents = listIncidents(1)
      const latest = incidents[0] || null
      return sendJson(res, 200, {
        architecture: "APEX-QC Pyramid",
        store: getStoreStats(),
        latestIncident: latest
          ? {
              id: latest.id,
              priority: latest.orchestrator.priority,
              severity: latest.orchestrator.severity,
              executionStatus: latest.fusionDecision.executionStatus,
            }
          : null,
      })
    }

    if (pathname === "/api/incidents" && method === "GET") {
      const limit = parseLimit(url.searchParams.get("limit"), 25, 200)
      return sendJson(res, 200, { incidents: listIncidents(limit) })
    }

    if (pathname.startsWith("/api/incidents/") && method === "GET") {
      const id = pathname.split("/").pop()
      const incident = getIncidentById(id)
      if (!incident) {
        return sendError(res, 404, "incident_not_found", "Incident was not found", { id })
      }
      return sendJson(res, 200, incident)
    }

    if (pathname === "/api/overrides/pending" && method === "GET") {
      return sendJson(res, 200, { pending: listPendingOverrides() })
    }

    if (pathname.startsWith("/api/overrides/") && method === "POST") {
      const parts = pathname.split("/")
      const overrideId = parts[3]
      const action = parts[4]
      if (!overrideId || !action || (action !== "approve" && action !== "reject")) {
        return sendError(res, 400, "invalid_override_route", "Use /api/overrides/:id/approve or /api/overrides/:id/reject")
      }

      const raw = await readBody(req)
      const payload = safeJsonParse(raw, {}) || {}
      const reviewer = typeof payload.reviewer === "string" ? payload.reviewer : "ops_manager"
      const result = resolvePendingOverride(overrideId, action === "approve" ? "APPROVE" : "REJECT", reviewer)

      if (!result) {
        return sendError(res, 404, "override_not_found", "Pending override not found", { overrideId })
      }

      return sendJson(res, 200, { override: result })
    }

    if (pathname === "/api/policies/current" && method === "GET") {
      return sendJson(res, 200, { policy: getPolicy() })
    }

    if (pathname === "/api/kpis" && method === "GET") {
      const limit = parseLimit(url.searchParams.get("limit"), 25, 500)
      return sendJson(res, 200, { snapshots: listKpiSnapshots(limit) })
    }

    if (pathname === "/api/admin/reset" && method === "POST") {
      return sendJson(res, 200, { reset: resetStore() })
    }

    return routeNotFound(res)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error"
    return sendError(res, 500, "internal_error", "Unhandled backend error", { message })
  }
})

server.listen(PORT, () => {
  // Keep startup logs explicit for hackathon demos.
  console.log(`APEX-QC backend listening on http://localhost:${PORT}`)
})
