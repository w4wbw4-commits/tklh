import { motion } from "framer-motion";

export const ChairMark = ({
  className = "",
  strokeWidth = 1.5,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Oval backrest */}
    <ellipse cx="32" cy="18" rx="10" ry="13" />
    <ellipse cx="32" cy="18" rx="8" ry="11" />
    {/* Backrest support bars */}
    <path d="M27 30.5 L26 38" />
    <path d="M32 31 L32 38" />
    <path d="M37 30.5 L38 38" />
    {/* Seat (curved cushion) */}
    <path d="M18 41 C 24 38, 40 38, 46 41 L 44 44 C 38 42, 26 42, 20 44 Z" />
    {/* Front apron line */}
    <path d="M20 44 C 26 46, 38 46, 44 44" />
    {/* Front legs with decorative knobs */}
    <path d="M22 45 L 19 58" />
    <circle cx="20.7" cy="50" r="1.2" />
    <path d="M42 45 L 45 58" />
    <circle cx="43.3" cy="50" r="1.2" />
    {/* Center back leg */}
    <path d="M32 46 L 32 58" />
    <circle cx="32" cy="50.5" r="1.2" />
  </svg>
);

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-2.5 ${className}`}
    >
      <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-olive shadow-soft ring-2 ring-gold/60">
        <ChairMark className="h-6 w-6 text-gold" strokeWidth={1.6} />
      </div>
      <div className="flex items-baseline leading-none">
        <span
          className="font-wordmark text-xl font-black tracking-tight text-primary-deep"
          style={{
            color: "hsl(var(--primary-deep))",
            WebkitTextFillColor: "hsl(var(--primary-deep))",
          }}
        >
          تِكله
        </span>
      </div>
    </motion.div>
  );
};
