import type { VendorRow } from "@/components/tekillah/vendor/types";
import { Clock, XCircle, ShieldCheck } from "lucide-react";

// Banner that informs the partner about their approval status across all
// portal pages so they always know whether they can transact.
export const StatusBanner = ({ vendor }: { vendor: VendorRow | null }) => {
  if (!vendor) return null;

  if (vendor.approval_status === "pending_approval") {
    return (
      <div className="mb-6 flex items-start gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-700">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-amber-800">ملفك قيد المراجعة من قِبل الإدارة</h3>
          <p className="mt-1 text-sm text-amber-700/85">
            بعض الميزات معطلة حتى تتم الموافقة. ستصلك إشعارات بمجرد صدور القرار.
          </p>
        </div>
      </div>
    );
  }

  if (vendor.approval_status === "rejected") {
    return (
      <div className="mb-6 flex items-start gap-4 rounded-3xl border border-destructive/30 bg-destructive/10 p-5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-destructive/20 text-destructive">
          <XCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-destructive">تم رفض الطلب</h3>
          <p className="mt-1 text-sm text-destructive/85">
            {vendor.rejection_reason || "يرجى مراجعة بياناتك وإعادة الإرسال."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-3xl border border-primary/20 bg-primary/5 p-4">
      <ShieldCheck className="h-5 w-5 text-primary" />
      <p className="text-sm font-bold text-foreground/80">
        حسابك مفعل ويظهر للعملاء — كل العمليات متاحة لك.
      </p>
    </div>
  );
};
