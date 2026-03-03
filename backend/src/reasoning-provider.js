import "./env.js"
import { runDomainAgents } from "./agents.js"
import { clamp } from "./utils.js"

function getModelId() {
  return process.env.NOVA_MODEL_ID || "amazon.nova-premier-v1:0"
}

function getRegion() {
  return process.env.AWS_REGION || "us-east-1"
}

function assertConverseModel(modelId) {
  const lower = String(modelId || "").toLowerCase()
  if (lower.includes("embeddings")) {
    throw new Error(
      "NOVA_MODEL_ID is an embeddings model. Use a Nova text/chat model compatible with Bedrock Converse."
    )
  }
}

function sanitizeDomainResult(item) {
  const validDomains = new Set(["demand", "inventory", "logistics", "pricing", "risk"])
  if (!item || typeof item !== "object" || !validDomains.has(item.domain)) {
    return null
  }

  const confidence = clamp(Number(item.confidence || 0.75), 0.5, 0.99)
  const summary = typeof item.summary === "string" ? item.summary : "No summary"
  const recommendation =
    item.recommendation && typeof item.recommendation === "object" ? item.recommendation : {}

  return {
    domain: item.domain,
    confidence,
    summary,
    recommendation,
  }
}

function extractJsonBlock(text) {
  if (!text || typeof text !== "string") {
    return null
  }

  const fenceStart = text.indexOf("```json")
  if (fenceStart !== -1) {
    const start = text.indexOf("\n", fenceStart)
    const end = text.indexOf("```", start + 1)
    if (start !== -1 && end !== -1) {
      return text.slice(start + 1, end).trim()
    }
  }

  const firstBracket = text.indexOf("[")
  const lastBracket = text.lastIndexOf("]")
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1)
  }

  return null
}

async function invokeBedrockNova(input) {
  const sdk = await import("@aws-sdk/client-bedrock-runtime")
  const { BedrockRuntimeClient, ConverseCommand } = sdk
  const modelId = getModelId()
  assertConverseModel(modelId)

  const client = new BedrockRuntimeClient({ region: getRegion() })

  const prompt = [
    "You are an operations orchestrator for quick commerce incidents.",
    "Return only JSON array with exactly 5 objects for domains:",
    '["demand","inventory","logistics","pricing","risk"].',
    'Each object must include: domain, confidence (0..1), summary, recommendation (object).',
    "Be concise and practical, no markdown.",
    "",
    `Incident input JSON: ${JSON.stringify(input)}`,
  ].join("\n")

  const command = new ConverseCommand({
    modelId,
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 700,
      temperature: 0.2,
      topP: 0.9,
    },
  })

  const response = await client.send(command)
  const text =
    response?.output?.message?.content?.map((item) => item.text || "").join("\n").trim() || ""
  const jsonCandidate = extractJsonBlock(text)
  if (!jsonCandidate) {
    throw new Error("Nova response did not contain parseable JSON array")
  }

  const parsed = JSON.parse(jsonCandidate)
  if (!Array.isArray(parsed)) {
    throw new Error("Nova response JSON is not an array")
  }

  const normalized = parsed.map(sanitizeDomainResult).filter(Boolean)
  const gotDomains = new Set(normalized.map((item) => item.domain))
  const requiredDomains = ["demand", "inventory", "logistics", "pricing", "risk"]
  const complete = requiredDomains.every((domain) => gotDomains.has(domain))
  if (!complete) {
    throw new Error("Nova response missing one or more required domains")
  }

  return normalized
}

export function reasoningRuntimeStatus() {
  const provider = (process.env.REASONING_PROVIDER || "sim").toLowerCase()
  return {
    provider,
    region: getRegion(),
    modelId: getModelId(),
    bedrockEnabled: provider === "bedrock",
  }
}

export async function resolveDomainResults(input) {
  const runtime = reasoningRuntimeStatus()

  if (!runtime.bedrockEnabled) {
    return {
      domainResults: runDomainAgents(input),
      reasoning: {
        provider: "sim",
        modelId: "local-heuristic-simulator",
        fallback: false,
      },
    }
  }

  try {
    const domainResults = await invokeBedrockNova(input)
    return {
      domainResults,
      reasoning: {
        provider: "bedrock",
        modelId: runtime.modelId,
        fallback: false,
      },
    }
  } catch (error) {
    return {
      domainResults: runDomainAgents(input),
      reasoning: {
        provider: "bedrock",
        modelId: runtime.modelId,
        fallback: true,
        fallbackReason: error instanceof Error ? error.message : "unknown_bedrock_error",
      },
    }
  }
}
