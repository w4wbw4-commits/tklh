import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const ISO = "yyyy-MM-dd";
const DISPLAY = "dd/MM/yyyy";
const isoToDate = (iso: string): Date | undefined => {
  if (!iso) return undefined;
  const d = parse(iso, ISO, new Date());
  return isValid(d) ? d : undefined;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onCreated: (id: string) => void;
}

export const CreateEventDialog = ({ open, onOpenChange, userId, onCreated }: Props) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? arLocale : enUS;
  const [title, setTitle] = useState(t("customer.create.defaultTitle"));
  const [eventDate, setEventDate] = useState("");
  const [city, setCity] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    title: z.string().trim().min(2, t("customer.create.shortTitle")).max(80),
    event_date: z.string().refine((v) => !!v && new Date(v) > new Date(), {
      message: t("customer.create.futureDate"),
    }),
    city: z.string().trim().max(60).optional(),
    guest_count: z.coerce.number().int().min(0).max(5000).optional(),
    total_budget: z.coerce.number().min(0).max(10_000_000).optional(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      title, event_date: eventDate, city, guest_count: guestCount, total_budget: budget,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from("events").insert({
      customer_id: userId,
      title: parsed.data.title,
      event_date: parsed.data.event_date,
      city: parsed.data.city || null,
      guest_count: parsed.data.guest_count ?? 0,
      total_budget: parsed.data.total_budget ?? 0,
    }).select("id").single();
    setSubmitting(false);
    if (error || !data) { toast.error(t("customer.create.createFailed")); return; }
    toast.success(t("customer.create.createSuccess"));
    onOpenChange(false);
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t("customer.create.title")}</DialogTitle>
          <DialogDescription>{t("customer.create.desc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-title">{t("customer.create.eventTitle")}</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={t("customer.create.eventTitlePlaceholder")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-date" className="font-arabic">{t("customer.create.date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="ev-date"
                    className={cn(
                      "h-10 w-full justify-start rounded-xl px-3 text-start font-normal tabular-nums",
                      !isoToDate(eventDate) && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
                    <span dir="ltr" className="tabular-nums">
                      {isoToDate(eventDate) ? format(isoToDate(eventDate)!, DISPLAY) : "DD/MM/YYYY"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={isoToDate(eventDate)}
                    onSelect={(d) => setEventDate(d ? format(d, ISO) : "")}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    locale={locale}
                    weekStartsOn={6}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-city">{t("customer.create.city")}</Label>
              <Input id="ev-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-guests">{t("customer.create.guestCount")}</Label>
              <Input id="ev-guests" type="number" min={0} value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)} placeholder="400" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-budget">{t("customer.create.budget")}</Label>
              <Input id="ev-budget" type="number" min={0} value={budget}
                onChange={(e) => setBudget(e.target.value)} placeholder="120000" />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("customer.create.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
