// Edge function: generate-invoice
// Generates an elegant PDF invoice with VAT and platform fee breakdown.
//
// SECURITY: deploys with verify_jwt = false, so the bearer token is validated
// in code. Only the booking's customer, the vendor that owns the booking, or an
// admin may generate the invoice, and every figure on the PDF is read from the
// database — never from the request body.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import { adminClient, corsHeaders, getCaller, isAdmin, json, UUID_RE } from "../_shared/auth.ts";

type BookingRow = {
  id: string;
  event_date: string;
  total_price: number | null;
  paid_amount: number | null;
  customer_id: string;
  vendor_id: string;
  vendor: { business_name: string | null; user_id: string } | null;
  package: { name: string | null } | null;
  platform_package: { name: string | null } | null;
  event: { title: string | null; city: string | null } | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId : "";
    if (!UUID_RE.test(bookingId)) return json({ error: "Invalid bookingId" }, 400);

    const admin = adminClient();
    const { data, error } = await admin
      .from("bookings")
      .select(
        "id, event_date, total_price, paid_amount, customer_id, vendor_id, vendor:vendors(business_name, user_id), package:packages(name), platform_package:platform_packages(name), event:events(title, city)",
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return json({ error: "Booking not found" }, 404);
    const b = data as unknown as BookingRow;

    // ---- Authorization: customer, owning vendor, or admin only -------------
    const isCustomer = b.customer_id === caller.id;
    const isOwningVendor = b.vendor?.user_id === caller.id;
    if (!isCustomer && !isOwningVendor && !(await isAdmin(caller.id))) {
      return json({ error: "Forbidden" }, 403);
    }

    // ---- Authoritative figures come from the database ---------------------
    const { data: settings } = await admin
      .from("platform_settings")
      .select("vat_percent, commission_percent")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const vatPct = Number(settings?.vat_percent ?? 15);
    const feePct = Number(settings?.commission_percent ?? 12);
    const subtotal = Number(b.total_price ?? 0);
    const vatAmount = Math.round((subtotal * vatPct) / 100);
    const platformFee = Math.round((subtotal * feePct) / 100);
    const totalDue = subtotal + vatAmount;
    const paid = Number(b.paid_amount ?? 0);
    const balance = Math.max(0, totalDue - paid);

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", b.customer_id)
      .maybeSingle();

    const eventTitle = b.event?.title ?? "Event booking";
    const city = b.event?.city ?? null;
    const customerName = profile?.display_name ?? "Customer";
    const vendorName = b.vendor?.business_name ?? "—";
    const packageName = b.package?.name ?? b.platform_package?.name ?? "—";

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Brand band
    doc.setFillColor(85, 107, 47); // olive
    doc.rect(0, 0, pageW, 90, "F");

    doc.setTextColor(245, 245, 240);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Tekillah", 40, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Luxury Event Planning Platform", 40, 68);

    // Invoice meta
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", pageW - 40, 50, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`#${b.id.slice(0, 8).toUpperCase()}`, pageW - 40, 68, { align: "right" });

    // Body
    doc.setTextColor(40, 50, 25);
    let y = 140;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(customerName, 40, y + 16);

    doc.setFont("helvetica", "bold");
    doc.text("EVENT DATE", pageW - 40, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date(b.event_date).toLocaleDateString("en-GB"), pageW - 40, y + 16, { align: "right" });

    y += 60;

    // Event title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(eventTitle, 40, y);
    if (city) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 110, 80);
      doc.text(city, 40, y + 16);
    }

    y += 50;

    // Table header
    doc.setDrawColor(220, 215, 200);
    doc.setLineWidth(0.5);
    doc.line(40, y, pageW - 40, y);
    y += 18;

    doc.setTextColor(85, 107, 47);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VENDOR / PACKAGE", 40, y);
    doc.text("AMOUNT (SAR)", pageW - 40, y, { align: "right" });
    y += 10;
    doc.line(40, y, pageW - 40, y);
    y += 22;

    // Row
    doc.setTextColor(40, 50, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(vendorName, 40, y);
    doc.setTextColor(100, 110, 80);
    doc.setFontSize(9);
    doc.text(packageName, 40, y + 14);

    doc.setTextColor(40, 50, 25);
    doc.setFontSize(11);
    doc.text(subtotal.toLocaleString("en-US"), pageW - 40, y, { align: "right" });

    y += 50;
    doc.line(40, y, pageW - 40, y);

    // Totals breakdown
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal", pageW - 200, y);
    doc.text(subtotal.toLocaleString("en-US"), pageW - 40, y, { align: "right" });

    y += 18;
    doc.setTextColor(120, 130, 100);
    doc.text(`Platform fee (${feePct}%)`, pageW - 200, y);
    doc.text(platformFee.toLocaleString("en-US"), pageW - 40, y, { align: "right" });

    y += 18;
    doc.setTextColor(40, 50, 25);
    doc.text(`VAT (${vatPct}%)`, pageW - 200, y);
    doc.text(vatAmount.toLocaleString("en-US"), pageW - 40, y, { align: "right" });

    y += 18;
    doc.text("Paid", pageW - 200, y);
    doc.text(paid.toLocaleString("en-US"), pageW - 40, y, { align: "right" });

    y += 24;
    doc.setDrawColor(85, 107, 47);
    doc.setLineWidth(1);
    doc.line(pageW - 200, y - 10, pageW - 40, y - 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(85, 107, 47);
    doc.text("Balance Due", pageW - 200, y);
    doc.text(`${balance.toLocaleString("en-US")} SAR`, pageW - 40, y, { align: "right" });

    // Trust footer
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 100);
    doc.setFont("helvetica", "normal");
    doc.text("100% Secure Payment  •  Saudi Payments Certified  •  Escrow Protected",
      pageW / 2, pageH - 60, { align: "center" });
    doc.text("Thank you for choosing Tekillah. This invoice is generated automatically.",
      pageW / 2, pageH - 40, { align: "center" });

    const dataUri = doc.output("datauristring");
    return json({ pdf: dataUri });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("generate-invoice error:", msg);
    return json({ error: msg }, 500);
  }
});
