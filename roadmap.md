# Task roadmap

- [x] Swap Navbar logo to left and menu button to right.
- [x] Add login/logout button to the site menu sheet with auth wiring.
- [x] Remove the "Join as a service provider" secondary CTA from the Hero.
- [x] Reduce Hero primary CTA width by 50% on mobile.
- [x] Remove the gold border/frame from the Navbar primary CTA.
- [x] Reduce Navbar height by ~25% on mobile only.
- [x] Copy ProblemSolutionAbout and OccasionsSection content/style into the About page.
- [x] Remove DashboardPreview section from homepage.
- [x] Refine only the `/` customer home visual identity, typography, and responsive sizing.
- [x] Verify the `/` home page at 375px, 768px, and 1440px in Arabic and English; pass build/typecheck.
- [x] Match the Customer Home typography hierarchy to the verified Cerimonia reference system.
- [x] Apply the new warm-stone Customer Home palette while preserving Tklh green.
- [x] Re-verify `/` at 375px, 768px, and 1440px in Arabic and English; pass build/typecheck.

## Partner portal — cancellation & invoices (this round)
- [x] Booking cancellation with mandatory reason, actor and timestamp (migration 0003).
- [x] Cancelled/rejected bookings release the exact section they held (DB `refresh_booking_availability` is the single source of truth).
- [x] Section-aware calendar colours: cream available, blue half men, purple half women, green both, amber unconfirmed.
- [x] Manual invoice PDF download includes CR/freelance doc, VAT number, customer, payment status, provider name in the corner. No WhatsApp sending.
- [x] Partner sidebar reduced to Overview / Bookings / Reviews / Reports / My data, with packages + manual booking folded into Bookings.
- [x] Monthly report page (revenue, expenses, depreciation) with detailed Excel export (migration 0004 vendor_expenses).
- [x] Manual booking issues a mandatory tax invoice, section-aware, with PDF download only.
- [x] Packages + seasonal offers manager inside the Bookings tabs.
- [ ] Phone + password partner login and "join as provider" form under the login (needs a real SMS provider).
