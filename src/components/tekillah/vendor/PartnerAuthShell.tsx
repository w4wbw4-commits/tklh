import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Logo } from "@/components/tekillah/Logo";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

interface PartnerAuthShellProps {
  title: string;
  description: string;
  canonical: string;
  eyebrow: string;
  heading: string;
  sub?: string;
  /** Wider layout for the full application form. */
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared frame for the partner login / registration / password-reset screens.
 * Uses the existing TKLH identity (logo + chair, velvet green, warm cream) —
 * no new palette, no redesign.
 */
export const PartnerAuthShell = ({
  title, description, canonical, eyebrow, heading, sub, wide, children, footer,
}: PartnerAuthShellProps) => (
  <div className="min-h-screen bg-gradient-soft">
    <SEO title={title} description={description} canonical={canonical} />

    <header className="sticky top-0 z-30 border-b border-gold/20 bg-background/80 backdrop-blur-xl">
      <div className={`mx-auto flex items-center justify-between px-4 py-3 sm:px-6 ${wide ? "max-w-4xl" : "max-w-xl"}`}>
        <Link to="/partner/login" className="flex items-center gap-2">
          <Logo />
        </Link>
        <Button variant="ghost" size="sm" asChild className="rounded-full text-foreground/70 hover:text-primary">
          <Link to="/">
            <Home className="me-1.5 h-4 w-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
        </Button>
      </div>
    </header>

    <main className={`mx-auto px-4 pb-20 pt-8 sm:px-6 ${wide ? "max-w-4xl" : "max-w-xl"}`}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-arabic text-2xl font-black leading-[1.45] text-primary-deep sm:text-3xl">
          {heading}
        </h1>
        {sub ? (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.7] text-foreground/70">{sub}</p>
        ) : null}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8"
      >
        {children}
      </motion.section>

      {footer ? <div className="mt-6 text-center text-sm text-foreground/60">{footer}</div> : null}
    </main>
  </div>
);

/** Saudi mobile field with a fixed +966 prefix — same look as the rest of TKLH. */
export const PhoneField = ({
  id, value, onChange, disabled,
}: { id: string; value: string; onChange: (v: string) => void; disabled?: boolean }) => (
  <div dir="ltr" className="flex items-center gap-2">
    <span className="grid h-12 shrink-0 place-items-center rounded-xl border border-border bg-muted/40 px-3 text-sm font-semibold text-foreground/70">
      +966
    </span>
    <input
      id={id}
      inputMode="numeric"
      autoComplete="tel"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="5X XXX XXXX"
      className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    />
  </div>
);
