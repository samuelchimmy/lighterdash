import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_TEMPLATES: Record<string, string> = {
  side_analysis: `You are an elite trading psychologist and performance coach. Analyze this trader's Long vs Short performance data and provide 2-3 sentences of insight. Focus on: Is their strategy better suited for bull or bear markets? Do they have a directional bias? Provide one actionable recommendation.`,
  
  maker_taker: `You are an elite trading psychologist and performance coach. Analyze this trader's Maker vs Taker performance data and provide 2-3 sentences of insight. Focus on: Are they more profitable when providing liquidity (Maker) or taking it (Taker)? Does their edge come from patience or aggression? Provide one actionable recommendation.`,
  
  limit_market: `You are an elite trading psychologist and performance coach. Analyze this trader's Limit vs Market order performance data and provide 2-3 sentences of insight. Focus on: Do they profit more from planned Limit orders or reactive Market orders? What does this reveal about their trading style? Provide one actionable recommendation.`,
  
  time_pattern: `You are an elite trading psychologist and performance coach. Analyze this trader's time-based performance patterns and provide 2-3 sentences of insight. Focus on: Which hours or days show consistent profitability or losses? What psychological factors might explain these patterns? Provide one actionable recommendation.`,
  
  market_performance: `You are an elite trading psychologist and performance coach. Analyze this trader's per-market performance data and provide 2-3 sentences of insight. Focus on: Which markets show the best risk-adjusted returns? Is there a mismatch between win rate and payoff ratio? Provide one actionable recommendation.`,
  
  overall_performance: `You are an elite trading psychologist and performance coach. Analyze this trader's overall KPI metrics and provide 3-4 sentences of comprehensive insight. Focus on: What story do these numbers tell about their trading approach? What is their biggest strength and weakness? Provide 2-3 prioritized recommendations for improvement.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metric_type, data } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = PROMPT_TEMPLATES[metric_type] || PROMPT_TEMPLATES.overall_performance;
    
    const userPrompt = `Here is the trader's performance data:\n${JSON.stringify(data, null, 2)}\n\nProvide your analysis.`;

    console.log(`Generating insight for metric_type: ${metric_type}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const insight = aiResponse.choices?.[0]?.message?.content || "Unable to generate insight.";

    console.log("Insight generated successfully");

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-trade-insight:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
