import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userHeaders, sampleData } = await req.json();
    
    if (!userHeaders || !Array.isArray(userHeaders)) {
      return new Response(
        JSON.stringify({ error: 'userHeaders array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a sample preview for context
    const samplePreview = sampleData 
      ? `\nSample data row:\n${JSON.stringify(sampleData, null, 2)}`
      : '';

    const systemPrompt = `You are a data mapping expert for trading CSV files. Your job is to analyze CSV column headers from trading platforms and map them to our standard format.

Our standard fields are:
- date: The timestamp or date of the trade (required)
- market: The trading pair, symbol, or asset name (required)
- side: The direction of the trade - Long/Short or Buy/Sell (required)
- size: The position size or amount traded
- price: The entry or exit price
- closedPnL: The realized profit or loss (required)
- fee: Trading fees or commissions
- role: Whether the trader was Maker or Taker
- type: Order type - Limit or Market

You MUST respond with ONLY a valid JSON object mapping our standard field names to the user's column headers.
Do not include any explanations, markdown, or additional text.
If you cannot find a good match for a field, use an empty string "".

Example response format:
{"date":"Time","market":"Symbol","side":"Direction","size":"Amount","price":"Price","closedPnL":"PnL","fee":"Fee","role":"","type":""}`;

    const userPrompt = `Analyze these CSV headers and map them to our standard trading fields:

User's CSV headers: ${JSON.stringify(userHeaders)}${samplePreview}

Return ONLY a JSON object mapping our fields (date, market, side, size, price, closedPnL, fee, role, type) to the user's headers.`;

    console.log('Calling AI for header mapping...');
    console.log('Headers:', userHeaders);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI raw response:', aiResponse);

    // Parse the JSON response - handle potential markdown code blocks
    let mappings: Record<string, string>;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();
      
      mappings = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a best-effort empty mapping
      mappings = {
        date: '',
        market: '',
        side: '',
        size: '',
        price: '',
        closedPnL: '',
        fee: '',
        role: '',
        type: ''
      };
    }

    console.log('Parsed mappings:', mappings);

    return new Response(
      JSON.stringify({ mappings, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-map-headers:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
