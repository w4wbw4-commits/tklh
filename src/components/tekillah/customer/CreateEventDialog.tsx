import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  title: z.string().trim().min(2, "عنوان قصير").max(80),
  event_date: z.string().refine((v) => !!v && new Date(v) > new Date(), {
    message: "اختر تاريخاً مستقبلياً",
  }),
  city: z.string().trim().max(60).optional(),
  guest_count: z.coerce.number().int().min(0).max(5000).optional(),
  total_budget: z.coerce.number().min(0).max(10_000_000).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onCreated: (id: string) => void;
}

export const CreateEventDialog = ({ open, onOpenChange, userId, onCreated }: Props) => {
  const [title, setTitle] = useState("مناسبتي");
  const [eventDate, setEventDate] = useState("");
  const [city, setCity] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      title,
      event_date: eventDate,
      city,
      guest_count: guestCount,
      total_budget: budget,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("events")
      .insert({
        customer_id: userId,
        title: parsed.data.title,
        event_date: parsed.data.event_date,
        city: parsed.data.city || null,
        guest_count: parsed.data.guest_count ?? 0,
        total_budget: parsed.data.total_budget ?? 0,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("تعذر إنشاء المناسبة");
      return;
    }
    toast.success("تم إنشاء المناسبة");
    onOpenChange(false);
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">مناسبة جديدة</DialogTitle>
          <DialogDescription>أدخل تفاصيل مناسبتك لتفعيل لوحة التحكم.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-title">عنوان المناسبة</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: زفاف عبدالله وريما"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-date">التاريخ</Label>
              <Input
                id="ev-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-city">المدينة</Label>
              <Input
                id="ev-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="الرياض"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-guests">عدد الضيوف</Label>
              <Input
                id="ev-guests"
                type="number"
                min={0}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-budget">الميزانية (ر.س)</Label>
              <Input
                id="ev-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="120000"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
