# APEX-QC Backend (Agentic AI)

This service implements the non-frontend APEX-QC flow:

1. Master orchestrator computes severity and activates domain agents.
2. Domain + worker agents run in parallel simulation.
3. Aggregators perform conflict and guardrail pre-checks.
4. Fusion decision engine builds executable actions.
5. KPI impact is computed and policy learning is updated.

## Agentic AI Fit (Amazon Nova)

- Multi-agent reasoning pattern: orchestrator + domain + worker + aggregator agents.
- Reasoning model alignment: Amazon Nova via Amazon Bedrock (judge-visible in `/api/health`).
- Autonomous decision loop with guardrails: confidence thresholds, impact caps, override pathway.
- Continuous learning loop: policy updates after measured KPI outcomes.

## Run

```bash
cd backend
npm run dev
```

Server defaults to `http://localhost:8080`.

## Enable Real Amazon Nova Reasoning

Set environment variables before starting backend:

```bash
set REASONING_PROVIDER=bedrock
set AWS_REGION=us-east-1
set NOVA_MODEL_ID=amazon.nova-pro-v1:0
set AWS_ACCESS_KEY_ID=...
set AWS_SECRET_ACCESS_KEY=...
set AWS_SESSION_TOKEN=...   # if using temporary creds
```

If Bedrock call fails, service auto-falls back to local simulation and reports fallback reason in incident logs.
Backend auto-loads `.env` from `backend/.env` (or current working directory `.env`) via `dotenv`.

## API

- `GET /api/health`
- `GET /api/runtime/reasoning`
- `GET /api/summary`
- `POST /api/incidents/simulate`
- `POST /api/incidents/simulate?hold=true` (30s pending human-override gate)
- `GET /api/incidents?limit=25`
- `GET /api/incidents/:id`
- `GET /api/overrides/pending`
- `POST /api/overrides/:id/approve`
- `POST /api/overrides/:id/reject`
- `GET /api/kpis?limit=25`
- `GET /api/policies/current`
- `POST /api/admin/reset` (demo only)

## AWS Keys and Access To Collect

Minimum credentials:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (only if temporary credentials)
- `AWS_REGION`
- `NOVA_MODEL_ID` (use a Converse-capable Nova model; do not use embeddings models)

Required IAM permissions:

- `bedrock:InvokeModel`
- `bedrock:Converse`
- `bedrock:ConverseStream` (optional, for future streaming)

Required account setup:

- Bedrock model access enabled for the selected Nova model in your chosen region.

## Example simulation request

```json
{
  "input": {
    "city": "Mumbai",
    "zone": "Andheri",
    "eventTag": "IPL match night",
    "demandSpikePercent": 340,
    "stockDepletionPercent": 94,
    "storeCapacityPercent": 89,
    "ridersAvailable": 4,
    "ridersNeeded": 22,
    "marginPercent": 3.1
  }
}
```
