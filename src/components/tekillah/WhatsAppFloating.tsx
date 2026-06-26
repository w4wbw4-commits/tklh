/**
 * Persistent floating WhatsApp button — bottom-left to avoid colliding with
 * scroll-to-top widgets, links straight to the concierge number with an
 * Arabic prefilled greeting.
 */
const NUMBER = "966530466360";
const MESSAGE =
  "السلام عليكم، أود التواصل مع تِكله بخصوص حجز/تنسيق مناسبة.";

export const WhatsAppFloating = () => (
  <a
    href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="تواصل مباشر عبر واتساب"
    className="fixed bottom-5 left-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.55)] ring-2 ring-white/70 transition-transform hover:scale-105 active:scale-95"
  >
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M16.04 6.13c-5.46 0-9.9 4.44-9.9 9.9 0 1.74.45 3.44 1.32 4.93l-1.4 5.12 5.25-1.38a9.86 9.86 0 0 0 4.72 1.2h.01c5.46 0 9.9-4.44 9.9-9.9a9.85 9.85 0 0 0-2.9-7 9.85 9.85 0 0 0-7-2.87Zm5.83 13.48c-.32-.16-1.88-.93-2.18-1.04-.29-.11-.5-.16-.7.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.7-1.69-.96-2.32-.25-.61-.52-.53-.7-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.6s1.13 3.02 1.29 3.23c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z"
      />
    </svg>
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#25D366] ring-2 ring-white" />
    </span>
  </a>
);
