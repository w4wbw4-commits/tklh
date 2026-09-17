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

## Partner portal — cancellation & invoices
- [x] Booking cancellation with mandatory reason, actor and timestamp (migration 0003).
- [x] Cancelled/rejected bookings release the exact section they held (DB `refresh_booking_availability` is the single source of truth).
- [x] Section-aware calendar colours.
- [x] Manual invoice PDF with CR/VAT/customer/status/provider. No WhatsApp sending.
- [x] Monthly report page with Excel export (migration 0004 vendor_expenses).
- [x] Packages + seasonal offers manager inside the Bookings tabs.

## Phase 1 — security & structure
- [x] Edge functions auth-hardened; SECURITY DEFINER grants tightened (0005, 0006).

## Phase 2 — availability single source of truth
- [x] `availability_for_dates` RPC + shared rules used by partner calendar and customer search (0007).

## Phase 3 — partner auth & registration
- [x] Phone+password login, OTP-verified registration, password reset (edge fn `partner-auth`).
- [x] Application intake + admin-only approval RPC (0008).
- [x] Private document storage verified; cross-partner reads blocked.
- [x] Fix role-resolution race that bounced approved partners off portal pages.
- [ ] Delete all test accounts / applications / storage objects created during verification.
- [ ] Real SMS provider (blocked: external integration; devCode is NOT SMS).

## Phase 4 — partner core portal
- [ ] Unified partner shell: logo + chair + «لوحة تحكم الشريك» on every partner page.
- [ ] Persistent notifications bell top-left across the portal.
- [ ] Sidebar limited to Overview / Bookings / Reviews / Reports / My data; other tools folded into sections.
- [ ] Overview metrics: occupancy %, monthly revenue, confirmed bookings, rating, upcoming + pending bookings, compact calendar.
- [ ] Partner data isolation verified end to end; legacy routes kept as aliases.
- [ ] Mobile/desktop smoke, build/typecheck/tests/lint.

## Phase 5+ (later, in order)
- [ ] Booking engine & cancellation, then remaining phases through final audit.
- [ ] Domain/DNS wiring deferred to the very end per user request.
