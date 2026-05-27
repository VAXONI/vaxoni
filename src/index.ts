export type VaxoniProvider = "vaxoni" | "rapidapi";
export type AnalyzeMode = "text" | "json";

export type VaxoniClientOptions =
{
  provider: VaxoniProvider;
  api_key: string;
  base_url?: string;
  timeout_ms?: number;
};

export type VaxoniQRL =
{
  riskScore: number;
  uncertaintyScore: number;
  confidenceScore: number;
  failureProbability: number;
  blockedLossEstimate: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  riskClass: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
};

export type VaxoniACECheck =
{
  name: string;
  passed: boolean;
  reason: string;
};

export type VaxoniACE =
{
  consistencyScore: number;
  manipulationRisk: number;
  decisionStability: "STABLE" | "WATCH" | "FRAGILE" | string;
  checks: VaxoniACECheck[];
};

export type VaxoniDDE =
{
  status: "PASS" | "HOLD" | "RED" | string;
  confidence: number;
  triggers: string[];
  safetyMode: "PROCEED" | "SAFE_HOLD" | "HARD_STOP" | string;
};

export type VaxoniAnalysisResult =
{
  qrl?: VaxoniQRL;
  ace?: VaxoniACE;
  dde?: VaxoniDDE;
  [key: string]: unknown;
};

export type VaxoniAnalysisResponse =
{
  status: "success" | "error" | string;
  latency?: string;
  result?: VaxoniAnalysisResult;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export class VaxoniApiError extends Error
{
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`VAXONI API error ${status}: ${body}`);
    this.name = "VaxoniApiError";
    this.status = status;
    this.body = body;
  }
}

const DEFAULT_BASE_URLS: Record<VaxoniProvider, string> =
{
  vaxoni: "https://api.vaxoni.com",
  rapidapi: `https://vaxoni-pass-hold-red-decision-api-powered-by-aether-core.p.rapidapi.com`
};

function trimTrailingSlash(value: string): string
{
  return value.replace(/\/+$/, "");
}

function assertValidMode(mode: AnalyzeMode): void
{
  if (mode !== "text" && mode !== "json")
  {
    throw new Error(`Invalid analyze mode: ${String(mode)}. Expected "text" or "json".`);
  }
}

function serializeBody(mode: AnalyzeMode, payload: unknown): string
{
  if (mode === "text")
  {
    return typeof payload === "string" ? payload : String(payload);
  }

  return typeof payload === "string" ? payload : JSON.stringify(payload);
}

function getContentType(mode: AnalyzeMode): string
{
  return mode === "text" ? "text/plain" : "application/json";
}

export class VaxoniClient
{
  readonly provider: VaxoniProvider;
  readonly api_key: string;
  readonly base_url: string;
  readonly timeout_ms: number;

  constructor(options: VaxoniClientOptions)
  {
    if (!options || typeof options !== "object") { throw new Error("VaxoniClient options are required."); }
    if (!options.provider) { throw new Error("VaxoniClient provider is required."); }
    if (!options.api_key) { throw new Error("VaxoniClient api_key is required."); }

    this.provider = options.provider;
    this.api_key = options.api_key;
    this.timeout_ms = options.timeout_ms ?? 30000;

    const selectedBaseUrl = options.base_url ?? DEFAULT_BASE_URLS[options.provider];

    if (!selectedBaseUrl) { throw new Error(`No base URL configured for provider "${options.provider}".`); }

    this.base_url = trimTrailingSlash(selectedBaseUrl);
  }

  private buildHeaders(mode: AnalyzeMode): Record<string, string>
  {
    const headers: Record<string, string> = { "Content-Type": getContentType(mode) };

    if (this.provider === "rapidapi")
    {
      headers["X-RapidAPI-Key"] = this.api_key;
      return headers;
    }

    headers["x-api-key"] = this.api_key;
    return headers;
  }

  async analyze(mode: AnalyzeMode, payload: unknown): Promise<VaxoniAnalysisResponse>
  {
    assertValidMode(mode);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout_ms);

    try
    {
      const response = await fetch(`${this.base_url}/v1/analyze`,
      {
        method: "POST",
        headers: this.buildHeaders(mode),
        body: serializeBody(mode, payload),
        signal: controller.signal
      });

      const text = await response.text();

      if (!response.ok) { throw new VaxoniApiError(response.status, text); }

      try
      {
        return JSON.parse(text) as VaxoniAnalysisResponse;
      }
      catch
      {
        throw new Error(`VAXONI API returned a non-JSON response: ${text}`);
      }
    }
    finally
    {
      clearTimeout(timeout);
    }
  }
}

export default VaxoniClient;