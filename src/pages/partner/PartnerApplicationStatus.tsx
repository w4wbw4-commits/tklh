import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, FileWarning, LogOut, ShieldCheck, XCircle } from "lucide-react";
import { partnerService } from "@/domain";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/domain/users/guards";
import { Button } from "@/components/ui/button";
import { PartnerAuthShell } from "@/components/tekillah/vendor/PartnerAuthShell";

type Status = "new" | "contacted" | "approved" | "rejected";

/**
 * Landing page for a signed-in partner whose account is not activated yet:
 * shows where the application stands (submitted / changes requested / rejected)
 * and never grants portal access — the vendor role does that.
 */
const PartnerApplicationStatus = () => {
  const { user, signOut } = useAuth();
  const { isVendor, isAdmin, loading: rolesLoading } = useRoles();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rolesLoading && (isVendor || isAdmin)) navigate("/partner", { replace: true });
  }, [rolesLoading, isVendor, isAdmin, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await partnerService.getMyApplication(user.id);
      setStatus((data?.status as Status | undefined) ?? null);
      setNotes(data?.review_notes ?? null);
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <PartnerAuthShell
        title="حالة طلب الانضمام | شركاء تِكله"
        description="تابع حالة طلب الانضمام كمزود خدمة في تِكله."
        canonical="/partner/status"
        eyebrow="لوحة تحكم الشريك"
        heading="سجّل الدخول لمتابعة طلبك"
      >
        <Button asChild className="h-12 w-full rounded-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">
          <Link to="/partner/login">تسجيل الدخول</Link>
        </Button>
      </PartnerAuthShell>
    );
  }

  const view =
    status === "rejected"
      ? { Icon: XCircle, title: "لم تتم الموافقة على الطلب", body: "راجع الملاحظات أدناه، ويمكنك التواصل مع فريق تِكله أو إرسال طلب محدَّث." }
      : status === "contacted"
        ? { Icon: FileWarning, title: "فريق التحقق يطلب تعديلات", body: "راجع الملاحظات أدناه وحدّث بيانات طلبك ثم أعد الإرسال." }
        : status === "approved"
          ? { Icon: ShieldCheck, title: "تم قبول طلبك", body: "إذا لم تفتح لوحة التحكم تلقائيًا، أعد تسجيل الدخول." }
          : status === "new"
            ? { Icon: Clock, title: "طلبك قيد المراجعة", body: "فريق تِكله يراجع كل طلب يدويًا. سنُشعرك فور صدور القرار، ويُفتح الوصول للوحة التحكم بعد الموافقة." }
            : { Icon: FileWarning, title: "لا يوجد طلب انضمام بعد", body: "أكمل نموذج الانضمام لتبدأ المراجعة." };

  return (
    <PartnerAuthShell
      title="حالة طلب الانضمام | شركاء تِكله"
      description="تابع حالة طلب الانضمام كمزود خدمة في تِكله."
      canonical="/partner/status"
      eyebrow="لوحة تحكم الشريك"
      heading={loading ? "جارٍ التحميل…" : view.title}
      sub={loading ? undefined : view.body}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { Icon: CheckCircle2, label: "استلام الطلب", done: status !== null },
          { Icon: Clock, label: "مراجعة الفريق", done: status === "approved" },
          { Icon: ShieldCheck, label: "تفعيل الحساب", done: status === "approved" },
        ].map(({ Icon, label, done }) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 ${done ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}
          >
            <Icon className={`h-5 w-5 ${done ? "text-primary" : "text-foreground/40"}`} />
            <div className="mt-2 font-arabic text-sm font-semibold text-foreground">{label}</div>
          </div>
        ))}
      </div>

      {notes ? (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed text-foreground/80">
          <span className="font-semibold">ملاحظات فريق التحقق: </span>
          {notes}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {status === null || status === "contacted" || status === "rejected" ? (
          <Button asChild className="rounded-full bg-primary-deep px-6 text-primary-foreground hover:bg-primary-deep/90">
            <Link to="/partner/register">{status === null ? "إكمال نموذج الانضمام" : "تحديث الطلب"}</Link>
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="rounded-full border-gold/50 px-6"
          onClick={async () => {
            await signOut();
            navigate("/partner/login", { replace: true });
          }}
        >
          <LogOut className="me-2 h-4 w-4" />
          خروج
        </Button>
      </div>
    </PartnerAuthShell>
  );
};

export default PartnerApplicationStatus;
