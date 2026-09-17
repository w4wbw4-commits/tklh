// Edge function: generate-invitation
// Generates an AI-designed wedding invitation card via Lovable AI Gateway.
//
// SECURITY: deploys with verify_jwt = false, so the bearer token is validated
// in code. AI credits are only ever spent for a signed-in user who owns the
// event being designed (or an admin). Prompt text is length-capped.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { adminClient, corsHeaders, getCaller, isAdmin, json, safeText, UUID_RE } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    if (!UUID_RE.test(eventId)) return json({ error: "Invalid eventId" }, 400);

    const admin = adminClient();
    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id, customer_id, title, event_date, city, theme")
      .eq("id", eventId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) return json({ error: "Event not found" }, 404);

    if (event.customer_id !== caller.id && !(await isAdmin(caller.id))) {
      return json({ error: "Forbidden" }, 403);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Display strings come from the caller only for formatting; content is
    // anchored to the stored event and hard length-capped before prompting.
    const title = safeText(body?.title, 120) || safeText(event.title, 120);
    const date = safeText(body?.date, 60) || String(event.event_date);
    const city = safeText(body?.city, 60) || safeText(event.city, 60);
    const theme =
      safeText(body?.theme, 160) ||
      safeText(event.theme, 160) ||
      "deep olive green and warm beige with subtle gold accents";

    const prompt = `Design an elegant, luxury Saudi wedding invitation card in portrait orientation (3:4).
Theme: ${theme}.
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
        return json({ error: "تم تجاوز الحد المسموح، حاول بعد قليل" }, 429);
      }
      if (response.status === 402) {
        return json({ error: "نفدت الأرصدة، يرجى الترقية" }, 402);
      }
      const txt = await response.text();
      console.error("AI gateway error:", response.status, txt);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const image = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!image) throw new Error("لم يتم إنشاء صورة");

    return json({ image });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("generate-invitation error:", msg);
    return json({ error: msg }, 500);
  }
});
