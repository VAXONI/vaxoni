# VAXONI JavaScript/TypeScript SDK

Official JavaScript/TypeScript SDK for the **VAXONI PASS/HOLD/RED Decision API** powered by **Aether Core**.

VAXONI analyzes structural operational behavior and returns deterministic decision states:

- **PASS** → Operationally stable profile
- **HOLD** → Additional verification recommended
- **RED** → Escalation or instability detected

VAXONI is intentionally conservative. **HOLD is preferred over incorrect PASS decisions.**

---

## Installation

```bash
npm install @vaxoni/sdk
```

---

## Supported Providers

| Provider | Usage |
|---|---|
| `vaxoni` | Direct VAXONI API customers |
| `rapidapi` | RapidAPI subscribers |

---

## VAXONI Direct

```ts
import { VaxoniClient } from "@vaxoni/sdk";

const client = new VaxoniClient({
  provider: "vaxoni",
  api_key: "YOUR_VAXONI_API_KEY"
});

const result = await client.analyze(
  "text",
  "Deployment validation completed successfully."
);

console.log(result.result?.dde);
```

---

## RapidAPI

```ts
import { VaxoniClient } from "@vaxoni/sdk";

const client = new VaxoniClient({
  provider: "rapidapi",
  api_key: "YOUR_RAPIDAPI_KEY"
});

const result = await client.analyze("json", {
  "...": "Flexible payload structure"
});

console.log(result.result?.dde);
```

---

## Analyze Text

```ts
const result = await client.analyze(
  "text",
  "Service heartbeat checks completed normally."
);
```

The SDK automatically sends:

```http
Content-Type: text/plain
```

---

## Analyze JSON

```ts
const result = await client.analyze("json", {
  source: "deployment-pipeline",
  status: "completed",
  notes: "No blocking anomaly detected."
});
```

The SDK automatically sends:

```http
Content-Type: application/json
```

VAXONI is format-independent and does not require a fixed request schema.

---

## Response Example

```json
{
  "status": "success",
  "latency": "0.17ms",
  "result": {
    "dde": {
      "status": "HOLD",
      "confidence": 0.82
    }
  }
}
```

Advanced response structures may include additional deterministic risk, stability, consistency, and arbitration metadata depending on operational context.

---

## Error Handling

```ts
import { VaxoniApiError } from "@vaxoni/sdk";

try {
  const result = await client.analyze("text", "hello");
  console.log(result);
} catch (error) {
  if (error instanceof VaxoniApiError) {
    console.error(error.status);
    console.error(error.body);
  } else {
    console.error(error);
  }
}
```

---

## Development

```bash
npm install
npm run typecheck
npm run build
```

---

## Run Examples

```bash
npm run dev:text
npm run dev:json
npm run dev_rapidapi:text
npm run dev_rapidapi:json
```

---

## License

MIT