import { motion } from "framer-motion";

/**
 * The official Tklh wax seal — velvet green disc carrying the official chair
 * mark asset (never redrawn in code). Used for any "confirmed" / "coming soon"
 * moment across the journey.
 */
export const WaxSeal = ({
  size = 132,
  label,
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    className={`relative grid place-items-center ${className}`}
    style={{ width: size, height: size }}
  >
    <div
      className="absolute inset-0 rounded-full bg-primary"
      style={{ boxShadow: "0 18px 40px -18px hsl(var(--primary) / 0.55)" }}
    />
    <div className="absolute inset-[6px] rounded-full border border-[hsl(var(--gold))]/45" />
    <img
      src="/tklh-chair-mark.png"
      alt=""
      aria-hidden
      className="relative w-[42%] opacity-90 brightness-0 invert"
    />
    {label && (
      <span className="relative mt-1 font-arabic text-sm font-bold tracking-wide text-[hsl(var(--gold))]">
        {label}
      </span>
    )}
  </motion.div>
);
