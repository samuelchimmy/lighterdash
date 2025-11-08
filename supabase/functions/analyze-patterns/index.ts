import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades, positions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare trade data summary for AI analysis
    const tradesSummary = trades.map((t: any) => ({
      timestamp: t.timestamp,
      market_id: t.market_id,
      size: t.size,
      price: t.price,
      usd_amount: t.usd_amount,
      hour: new Date(t.timestamp * 1000).getHours(),
      day: new Date(t.timestamp * 1000).getDay(),
      pnl: t.pnl || 0,
      isWin: (t.pnl || 0) > 0,
    }));

    const systemPrompt = `You are an expert trading pattern analyst. Analyze the provided trading data to identify high-probability setups.

Focus on:
1. Time-based patterns (best hours/days for trading)
2. Position size patterns (optimal size ranges)
3. Market volatility patterns (price movement correlations)
4. Win/loss streak patterns
5. Entry/exit timing patterns

Provide actionable insights with specific thresholds and conditions that lead to higher win rates.`;

    const userPrompt = `Analyze these ${trades.length} trades and identify high-probability trading patterns:

${JSON.stringify(tradesSummary, null, 2)}

Identify patterns and provide specific trading rules based on historical performance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_patterns",
              description: "Identify high-probability trading patterns from historical data",
              parameters: {
                type: "object",
                properties: {
                  patterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        conditions: {
                          type: "array",
                          items: { type: "string" }
                        },
                        winRate: { type: "number" },
                        avgPnL: { type: "number" },
                        sampleSize: { type: "number" },
                        confidence: { type: "string", enum: ["low", "medium", "high"] },
                        recommendation: { type: "string" }
                      },
                      required: ["name", "description", "conditions", "winRate", "sampleSize", "confidence", "recommendation"],
                      additionalProperties: false
                    }
                  },
                  summary: { type: "string" },
                  topRecommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["patterns", "summary", "topRecommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "identify_patterns" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-patterns:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
