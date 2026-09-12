import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Star, MessageSquareText, TrendingUp } from "lucide-react";
import { reviewsService } from "@/domain";
import { ReviewsList } from "@/components/tekillah/reviews/ReviewsList";
import { fmtRating, fmtNumber } from "@/i18n/format";

interface Summary {
  avg_rating: number;
  reviews_count: number;
  avg_communication: number;
  avg_punctuality: number;
  avg_quality: number;
}

export const VendorReviews = ({ vendorId, vendorUserId }: { vendorId: string; vendorUserId: string }) => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await reviewsService.getRatingsSummary(vendorId);
      setSummary((data as Summary | null) ?? {
        avg_rating: 0, reviews_count: 0, avg_communication: 0, avg_punctuality: 0, avg_quality: 0,
      });
      setLoading(false);
    })();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-arabic text-lg font-semibold text-foreground">{t("vendor.reviews.title")}</h3>
        <p className="mt-1 text-sm text-foreground/65">{t("vendor.reviews.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={Star}
          label={t("vendor.reviews.avgRating")}
          value={summary?.reviews_count ? fmtRating(summary.avg_rating) : "—"}
          highlight
        />
        <SummaryCard
          icon={MessageSquareText}
          label={t("vendor.reviews.totalReviews")}
          value={fmtNumber(summary?.reviews_count ?? 0)}
        />
        <SummaryCard
          icon={TrendingUp}
          label={t("reviews.fields.communication")}
          value={summary?.reviews_count ? fmtRating(Number(summary.avg_communication)) : "—"}
        />
        <SummaryCard
          icon={TrendingUp}
          label={t("reviews.fields.quality")}
          value={summary?.reviews_count ? fmtRating(Number(summary.avg_quality)) : "—"}
        />
      </div>

      <ReviewsList vendorId={vendorId} canReply vendorUserId={vendorUserId} />
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, highlight }: {
  icon: typeof Star; label: string; value: string; highlight?: boolean;
}) => (
  <div className={`rounded-2xl border p-4 shadow-card ${highlight ? "border-amber-400/30 bg-amber-400/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-3">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${highlight ? "bg-amber-400 text-white" : "bg-secondary text-primary"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] text-foreground/65">{label}</div>
        <div className="mt-0.5 font-arabic text-lg font-semibold text-foreground">{value}</div>
      </div>
    </div>
  </div>
);
