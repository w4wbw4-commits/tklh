import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, ShieldCheck, Clock } from "lucide-react";
import type { VendorRow } from "@/components/tekillah/vendor/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vendor: VendorRow | null;
  onEnter: () => void;
}

export const WelcomeDialog = ({ open, onOpenChange, vendor, onEnter }: Props) => {
  const isPending = vendor?.approval_status === "pending_approval";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary-deep">
            <PartyPopper className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center font-arabic text-2xl font-black">
            أهلاً بك في بوابة شركاء TKLH 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {vendor?.business_name && (
              <span className="mt-2 block font-bold text-foreground">{vendor.business_name}</span>
            )}
            تم حفظ بياناتك بنجاح. لوحة التحكم الكاملة جاهزة لك الآن.
          </DialogDescription>
        </DialogHeader>

        <div className={`mt-2 flex items-start gap-3 rounded-2xl border p-4 ${
          isPending ? "border-amber-500/30 bg-amber-500/10" : "border-primary/20 bg-primary/5"
        }`}>
          {isPending ? (
            <Clock className="h-5 w-5 shrink-0 text-amber-700" />
          ) : (
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          )}
          <p className="text-sm text-foreground/80">
            {isPending
              ? "ملفك الآن قيد المراجعة. تستطيع تصفح اللوحة وإعداد الباقات والتسعير، وستفعل الحجوزات فور الاعتماد."
              : "حسابك مفعل ويظهر للعملاء — تفقد طلبات الحجز الجديدة فور وصولها."}
          </p>
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-col">
          <Button onClick={onEnter} size="lg" className="w-full">
            ادخل لوحة التحكم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
