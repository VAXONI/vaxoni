import { VaxoniClient } from "../../src/index";

(async () =>
{
  try
  {
    const client = new VaxoniClient({ provider: 'vaxoni', api_key: 'YOUR_API_KEY' });
    const result = await client.analyze("json", { source: "deployment-pipeline", status: "completed", notes: "Runtime validation completed. No blocking anomaly was detected." });

    console.log(JSON.stringify(result, null, 2));
  }
  catch (err)
  {
    console.error("Vaxoni error:", err);
  }
})();