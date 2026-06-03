import { motion } from "framer-motion";

/**
 * Official TKLH wordmark — Arabic "تِكلَه" paired with a hand-drawn
 * medallion (Louis-style) chair to the side. Colors lock to the brand:
 * deep olive-green ink for the wordmark + chair outline, cream fill
 * for the chair body. Matches the official brand sheet.
 */
const ChairMark = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 60 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Oval back */}
    <ellipse
      cx="30"
      cy="20"
      rx="16"
      ry="18"
      fill="hsl(var(--cream))"
      stroke="hsl(var(--primary-deep))"
      strokeWidth="1.6"
    />
    {/* Inner oval detail */}
    <ellipse
      cx="30"
      cy="20"
      rx="12"
      ry="14"
      stroke="hsl(var(--primary-deep))"
      strokeWidth="0.8"
      opacity="0.5"
    />
    {/* Seat */}
    <path
      d="M10 44 Q30 38 50 44 L46 52 Q30 56 14 52 Z"
      fill="hsl(var(--cream))"
      stroke="hsl(var(--primary-deep))"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Back-to-seat connectors */}
    <line x1="22" y1="38" x2="20" y2="46" stroke="hsl(var(--primary-deep))" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="38" y1="38" x2="40" y2="46" stroke="hsl(var(--primary-deep))" strokeWidth="1.4" strokeLinecap="round" />
    {/* Front legs with turned detail */}
    <line x1="16" y1="52" x2="14" y2="74" stroke="hsl(var(--primary-deep))" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="44" y1="52" x2="46" y2="74" stroke="hsl(var(--primary-deep))" strokeWidth="1.6" strokeLinecap="round" />
    {/* Back legs */}
    <line x1="24" y1="54" x2="22" y2="72" stroke="hsl(var(--primary-deep))" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    <line x1="36" y1="54" x2="38" y2="72" stroke="hsl(var(--primary-deep))" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
    {/* Leg turn rings */}
    <line x1="13" y1="66" x2="17" y2="66" stroke="hsl(var(--primary-deep))" strokeWidth="1" strokeLinecap="round" />
    <line x1="43" y1="66" x2="47" y2="66" stroke="hsl(var(--primary-deep))" strokeWidth="1" strokeLinecap="round" />
    <line x1="13" y1="60" x2="17" y2="60" stroke="hsl(var(--primary-deep))" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
    <line x1="43" y1="60" x2="47" y2="60" stroke="hsl(var(--primary-deep))" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-2 ${className}`}
    >
      <span
        className="font-wordmark text-2xl font-black leading-none tracking-tight"
        style={{
          color: "hsl(var(--primary-deep))",
          WebkitTextFillColor: "hsl(var(--primary-deep))",
        }}
      >
        تِكلَه
      </span>
      <ChairMark className="h-9 w-auto" />
    </motion.div>
  );
};
