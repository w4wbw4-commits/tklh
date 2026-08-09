// ---------------------------------------------------------------------------
// BrandMarks — official-style payment brand marks drawn as inline SVG so they
// stay crisp at any size and need no external logo service. Each mark keeps the
// brand's own colours (brand assets are exempt from the theme tokens).
// ---------------------------------------------------------------------------

type MarkProps = { className?: string };

const box = "block h-6 w-auto";

export const VisaMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 78 26" className={`${box} ${className}`} role="img" aria-label="Visa">
    <text
      x="0"
      y="20"
      fill="#1434CB"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontSize="22"
      fontStyle="italic"
      fontWeight="700"
      letterSpacing="-0.5"
    >
      VISA
    </text>
  </svg>
);

export const MastercardMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 64 26" className={`${box} ${className}`} role="img" aria-label="Mastercard">
    <circle cx="20" cy="13" r="11" fill="#EB001B" />
    <circle cx="34" cy="13" r="11" fill="#F79E1B" />
    <path
      d="M27 3.6a11 11 0 0 0 0 18.8 11 11 0 0 0 0-18.8Z"
      fill="#FF5F00"
    />
  </svg>
);

export const ApplePayMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 72 26" className={`${box} ${className}`} role="img" aria-label="Apple Pay">
    <path
      d="M13.4 7.6c-.8.9-2 1.6-3.2 1.5-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.6 3.2-1.6.1 1.3-.4 2.5-1.1 3.4Zm1.1 1.8c-1.8-.1-3.3 1-4.1 1-.9 0-2.1-1-3.5-1-1.8 0-3.4 1-4.3 2.7-1.9 3.2-.5 8 1.3 10.6.9 1.3 2 2.7 3.4 2.7 1.3 0 1.8-.9 3.5-.9s2.1.8 3.5.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1.1-2.7-4 0-2.5 2-3.7 2.1-3.8-1-1.5-2.7-1.6-3.8-1.6Z"
      fill="#111111"
    />
    <text
      x="24"
      y="20"
      fill="#111111"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize="18"
      fontWeight="500"
    >
      Pay
    </text>
  </svg>
);

export const MadaMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 74 26" className={`${box} ${className}`} role="img" aria-label="mada">
    <path d="M2 18.5h12.5l4-11h4.5l-4 11H26L30 7.5h4.5l-4 11h5.5v3.2H2v-3.2Z" fill="#1A1A1A" />
    <path d="M40 4h4.6l-6.4 17.7H33.6L40 4Z" fill="#84C341" />
    <path d="M47.5 4h4.6l-6.4 17.7H41L47.5 4Z" fill="#00A9E0" />
    <path d="M55 4h4.6l-6.4 17.7h-4.7L55 4Z" fill="#F5A800" />
  </svg>
);

export const TabbyMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 76 26" className={`${box} ${className}`} role="img" aria-label="tabby">
    <rect x="0" y="2" width="76" height="22" rx="11" fill="#3EEDBF" />
    <text
      x="38"
      y="18"
      textAnchor="middle"
      fill="#0A1E2B"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize="14"
      fontWeight="700"
      letterSpacing="-0.4"
    >
      tabby
    </text>
  </svg>
);

export const TamaraMark = ({ className = "" }: MarkProps) => (
  <svg viewBox="0 0 88 26" className={`${box} ${className}`} role="img" aria-label="tamara">
    <text
      x="0"
      y="19"
      fill="#2A2E5C"
      fontFamily="Helvetica, Arial, sans-serif"
      fontSize="17"
      fontWeight="700"
      letterSpacing="-0.4"
    >
      tamara
    </text>
    <circle cx="82" cy="8" r="4" fill="#FF6E4E" />
  </svg>
);

export const PAYMENT_MARKS = [
  { key: "tabby", Mark: TabbyMark },
  { key: "tamara", Mark: TamaraMark },
  { key: "mada", Mark: MadaMark },
  { key: "applepay", Mark: ApplePayMark },
  { key: "visa", Mark: VisaMark },
  { key: "mastercard", Mark: MastercardMark },
] as const;
