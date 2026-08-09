// ---------------------------------------------------------------------------
// WhatsAppFloatingButton — the floating slot previously held by the role
// switcher. WhatsApp glyph pressed into a deep-green wax seal.
// ---------------------------------------------------------------------------
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const WhatsAppFloatingButton = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const message = isAr
    ? "مرحبًا تِكله، أبي أخطط لمناسبتي 👋"
    : "Hi Tklh, I'd like to plan my event 👋";
  const label = isAr ? "تواصل معنا على واتساب" : "Chat with us on WhatsApp";

  return (
    <motion.a
      href={buildWhatsappLink({ message })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 320, damping: 18 }}
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-5 end-5 z-40 block"
      style={{ filter: "drop-shadow(0 10px 18px rgba(11,32,22,0.34))" }}
    >
      <svg viewBox="0 0 100 100" className="h-[58px] w-[58px] sm:h-[64px] sm:w-[64px]" aria-hidden="true">
        <defs>
          <radialGradient id="wa-seal-wax" cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#4E7A5F" />
            <stop offset="46%" stopColor="#163726" />
            <stop offset="100%" stopColor="#0B2016" />
          </radialGradient>
          <clipPath id="wa-seal-clip">
            <path d="M50 4 C62 4 70 9 79 15 C89 22 96 31 96 44 C96 57 92 68 83 78 C74 88 62 96 50 96 C38 96 27 89 18 79 C8 68 4 57 4 44 C4 31 12 21 22 15 C31 9 38 4 50 4 Z" />
          </clipPath>
          <filter id="wa-seal-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <path
          d="M50 4 C62 4 70 9 79 15 C89 22 96 31 96 44 C96 57 92 68 83 78 C74 88 62 96 50 96 C38 96 27 89 18 79 C8 68 4 57 4 44 C4 31 12 21 22 15 C31 9 38 4 50 4 Z"
          fill="url(#wa-seal-wax)"
        />

        <g clipPath="url(#wa-seal-clip)">
          <path
            d="M50 4 C62 4 70 9 79 15 C89 22 96 31 96 44 C96 57 92 68 83 78 C74 88 62 96 50 96 C38 96 27 89 18 79 C8 68 4 57 4 44 C4 31 12 21 22 15 C31 9 38 4 50 4 Z"
            fill="none"
            stroke="#0B2016"
            strokeWidth="8"
            opacity="0.55"
            filter="url(#wa-seal-blur)"
          />
          <ellipse cx="40" cy="24" rx="30" ry="17" fill="#ffffff" opacity="0.18" filter="url(#wa-seal-blur)" />

          {/* Embossed WhatsApp glyph — same hue, darker press + lit lip */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <g stroke="#6F9C80" opacity="0.5" transform="translate(1,1.2)">
              <path d="M28 72 L32 60 A22 22 0 1 1 40 68 Z" />
              <path d="M42 44 C42 54 47 59 57 60 C60 60 61 56 60 54 L55 52 L52 55 C49 53 48 52 46 49 L49 46 L47 41 C45 40 42 41 42 44 Z" />
            </g>
            <g stroke="#0B2016" opacity="0.85">
              <path d="M28 72 L32 60 A22 22 0 1 1 40 68 Z" />
              <path d="M42 44 C42 54 47 59 57 60 C60 60 61 56 60 54 L55 52 L52 55 C49 53 48 52 46 49 L49 46 L47 41 C45 40 42 41 42 44 Z" />
            </g>
          </g>
        </g>
      </svg>
    </motion.a>
  );
};
