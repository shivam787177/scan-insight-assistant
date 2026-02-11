import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert medical imaging AI assistant. Analyze the provided medical scan image and return a structured JSON response.

IMPORTANT: You must respond ONLY with valid JSON matching this exact structure (no markdown, no code fences):

{
  "scanType": "X-ray" | "MRI" | "CT" | "Ultrasound" | "Unknown",
  "imageQuality": "Good" | "Moderate" | "Poor",
  "status": "Normal" | "Abnormal" | "Uncertain",
  "overallConfidence": <number 0-100>,
  "urgencyLevel": "low" | "medium" | "high",
  "recommendation": "<string>",
  "suspectedConditions": [
    { "name": "<string>", "confidence": <number 0-100>, "description": "<string>" }
  ],
  "highlightedRegions": [
    { "id": "<string>", "location": "<string>", "description": "<string>", "x": <number 0-100>, "y": <number 0-100>, "width": <number 5-40>, "height": <number 5-40>, "severity": "low" | "medium" | "high" }
  ],
  "isUncertain": <boolean>,
  "isPoorQualityFailure": <boolean>,
  "differentialDiagnoses": [
    { "name": "<string>", "confidence": <number 0-100>, "evidence": ["<string>"] }
  ] | null
}

Rules:
- If image quality is poor (photo of screen, blurry, etc.), set isPoorQualityFailure=true, status="Uncertain", overallConfidence=0
- If uncertain, provide differentialDiagnoses with top 3 possibilities
- highlightedRegions x/y/width/height are percentages of image dimensions
- Be conservative: only flag abnormalities you're reasonably confident about
- Always include a clinical recommendation
- This is for clinical assistance only, not final diagnosis`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this medical scan image. Return only the JSON structure as specified.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64.startsWith("data:")
                      ? imageBase64
                      : `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    let content = aiResult.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid response format");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-scan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
