// Edge function: generate-invitation
// Generates an AI-designed wedding invitation card via Lovable AI Gateway (image model)
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, date, city, theme } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Design an elegant, luxury Saudi wedding invitation card in portrait orientation (3:4).
Theme: ${theme || "deep olive green and warm beige with subtle gold accents"}.
Style: minimalist, premium, high-end, refined Arabic calligraphy aesthetics.
Include the title at the top in beautiful Arabic typography: "${title}".
Add the date elegantly: "${date}".
${city ? `Mention the city: "${city}".` : ""}
Add subtle ornamental borders or botanical motifs (olive branches). 
Soft cream background with deep olive (#556B2F) accents.
Do not include any people or photographs. Pure typography and decorative elements only.
Make sure all Arabic text is rendered cleanly and is fully legible.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول بعد قليل" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "نفدت الأرصدة، يرجى الترقية" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const txt = await response.text();
      console.error("AI gateway error:", response.status, txt);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const image = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!image) throw new Error("لم يتم إنشاء صورة");

    return new Response(JSON.stringify({ image }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("generate-invitation error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
