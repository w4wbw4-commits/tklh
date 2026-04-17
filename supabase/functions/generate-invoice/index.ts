// Edge function: generate-invoice
// Generates an elegant PDF invoice with VAT and platform fee breakdown
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoicePayload {
  eventTitle: string;
  eventDate: string;
  city?: string | null;
  customerName?: string;
  vendorName: string;
  packageName: string;
  totalPrice: number;
  paidAmount: number;
  bookingId: string;
  vatPercent?: number;       // default 15
  platformPercent?: number;  // default 12
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const p: InvoicePayload = await req.json();
    const vatPct = p.vatPercent ?? 15;
    const feePct = p.platformPercent ?? 12;
    const subtotal = Number(p.totalPrice || 0);
    const vat = Math.round(subtotal * vatPct) / 100 * 100; // keep integer-friendly
    const platformFee = Math.round(subtotal * feePct) / 100 * 100;
    const totalDue = subtotal + Math.round(subtotal * vatPct / 100);
    const paid = Number(p.paidAmount || 0);
    const balance = Math.max(0, totalDue - paid);

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
    doc.text(`#${p.bookingId.slice(0, 8).toUpperCase()}`, pageW - 40, 68, { align: "right" });

    // Body
    doc.setTextColor(40, 50, 25);
    let y = 140;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(p.customerName || "Customer", 40, y + 16);

    doc.setFont("helvetica", "bold");
    doc.text("EVENT DATE", pageW - 40, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date(p.eventDate).toLocaleDateString("en-GB"), pageW - 40, y + 16, { align: "right" });

    y += 60;

    // Event title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(p.eventTitle, 40, y);
    if (p.city) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 110, 80);
      doc.text(p.city, 40, y + 16);
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
    doc.text(p.vendorName, 40, y);
    doc.setTextColor(100, 110, 80);
    doc.setFontSize(9);
    doc.text(p.packageName, 40, y + 14);

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
    doc.text(Math.round(subtotal * vatPct / 100).toLocaleString("en-US"), pageW - 40, y, { align: "right" });

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
    return new Response(JSON.stringify({ pdf: dataUri }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("generate-invoice error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
