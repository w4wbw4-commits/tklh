import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import chairMark from "/tklh-chair-mark.png";

interface EmptyStateProps {
  /** Kept for API compatibility — the official chair mark is used instead. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; to?: string; onClick?: () => void };
  className?: string;
}

/**
 * Branded, animated empty-state used across customer + vendor + admin dashboards.
 * Keeps the product feeling intentional even when data is sparse.
 */
export const EmptyState = ({ title, description, cta, className }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={
        "relative overflow-hidden rounded-3xl border border-dashed border-primary/25 bg-gradient-soft p-8 text-center sm:p-12 " +
        (className ?? "")
      }
    >
      {/* Decorative ambient orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-secondary/40 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <img
          src={chairMark}
          alt=""
          aria-hidden
          className="h-16 w-16 select-none object-contain opacity-30"
          draggable={false}
        />
        <h3 className="mt-5 font-arabic text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/65 sm:text-[15px]">{description}</p>
        )}
        {cta && (
          <div className="mt-5">
            {cta.to ? (
              <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
            ) : (
              <Button onClick={cta.onClick} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {cta.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
