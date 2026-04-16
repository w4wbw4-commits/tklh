import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { EventRow } from "./types";
import { useTranslation } from "react-i18next";
import { fmtDateTime } from "@/i18n/format";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: EventRow;
}

export const InvitationDialog = ({ open, onOpenChange, event }: Props) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const dateLabel = fmtDateTime(event.event_date);

  const generateAiCard = async () => {
    setGenerating(true);
    setAiImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invitation", {
        body: {
          title: event.title, date: dateLabel, city: event.city ?? "",
          theme: event.theme ?? "luxury olive green and beige Saudi wedding",
        },
      });
      if (error) throw error;
      if (data?.image) { setAiImage(data.image); toast.success(t("customer.invitation.designed")); }
      else throw new Error(t("customer.invitation.noImage"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("customer.invitation.designFailed");
      toast.error(msg);
    } finally { setGenerating(false); }
  };

  const downloadTemplate = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; a.download = `invitation-${event.id}.png`; a.click();
      toast.success(t("customer.invitation.downloaded"));
    } catch { toast.error(t("customer.invitation.downloadFailed")); }
    finally { setExporting(false); }
  };

  const downloadAi = () => {
    if (!aiImage) return;
    const a = document.createElement("a");
    a.href = aiImage; a.download = `invitation-ai-${event.id}.png`; a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("customer.invitation.title")}</DialogTitle>
          <DialogDescription>{t("customer.invitation.desc")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary/60">
            <TabsTrigger value="template" className="rounded-full">{t("customer.invitation.template")}</TabsTrigger>
            <TabsTrigger value="ai" className="rounded-full">
              <Sparkles className="me-1 h-3.5 w-3.5" /> {t("customer.invitation.ai")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-6">
            <div className="flex flex-col items-center gap-4">
              <div ref={cardRef}
                className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl bg-gradient-olive p-8 text-primary-foreground shadow-luxury">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(0_0%_100%/0.18),transparent_60%)]" />
                <div className="relative flex h-full flex-col items-center justify-between text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.4em] text-primary-foreground/70">
                      {t("customer.invitation.kicker")}
                    </div>
                    <div className="mt-3 font-arabic text-3xl font-bold leading-tight">{event.title}</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-px w-16 bg-primary-foreground/40" />
                    <div className="font-arabic text-sm text-primary-foreground/85">{t("customer.invitation.youAreInvited")}</div>
                    <div className="font-arabic text-base font-medium">{dateLabel}</div>
                    {event.city && <div className="text-xs text-primary-foreground/75">{event.city}</div>}
                    <div className="h-px w-16 bg-primary-foreground/40" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/65">تكلّة • Tekillah</div>
                </div>
              </div>

              <Button onClick={downloadTemplate} disabled={exporting}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {exporting ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Download className="me-1 h-4 w-4" />}
                {t("customer.invitation.download")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <div className="flex flex-col items-center gap-4">
              {aiImage ? (
                <img src={aiImage} alt={t("customer.invitation.altAi")}
                  className="aspect-[3/4] w-full max-w-xs rounded-3xl border border-border object-cover shadow-luxury" />
              ) : (
                <div className="grid aspect-[3/4] w-full max-w-xs place-items-center rounded-3xl border border-dashed border-border bg-card p-6 text-center text-sm text-foreground/60">
                  {generating ? (
                    <div className="space-y-3">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      <div>{t("customer.invitation.designing")}</div>
                    </div>
                  ) : t("customer.invitation.pressToDesign")}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={generateAiCard} disabled={generating}
                  className="rounded-full bg-gradient-olive text-primary-foreground hover:opacity-90">
                  {generating ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Sparkles className="me-1 h-4 w-4" />}
                  {aiImage ? t("customer.invitation.redesign") : t("customer.invitation.designMine")}
                </Button>
                {aiImage && (
                  <Button onClick={downloadAi} variant="outline" className="rounded-full">
                    <Download className="me-1 h-4 w-4" /> {t("customer.invitation.downloadShort")}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
