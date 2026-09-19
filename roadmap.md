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
- [x] Delete all test accounts / applications / storage objects created during verification.
- [ ] Real SMS provider (blocked: external integration; devCode is NOT SMS).

## Phase 4 — partner core portal
- [x] Unified partner shell: logo + chair + «لوحة تحكم الشريك» on every partner page.
- [x] Persistent notifications bell top-left across the portal.
- [x] Sidebar limited to Overview / Bookings / Reviews / Reports / My data; other tools folded into sections.
- [x] Overview metrics: occupancy %, monthly revenue, confirmed bookings, rating, upcoming + pending bookings, compact calendar.
- [x] Partner data isolation verified end to end; legacy routes kept as aliases.
- [x] Mobile/desktop smoke, build/typecheck/tests/lint.

## Phase 5 — booking engine & cancellation
- [x] Full lifecycle verified: pending → confirmed/rejected → completed/cancelled, rows never deleted.
- [x] Cancellation = status change with mandatory reason, timestamp, actor and actor role (customer/vendor/admin).
- [x] Cancelling releases only the held section; rejected/cancelled pending leaves no ghost availability (DB scenarios 1–8).
- [x] Double-booking blocked in the database (migration 0009 `prevent_double_booking`): same section, `both`, pending vs confirmed, and the vendor's own manual blocks.
- [x] Requested section now stored on customer bookings so a men-only request no longer holds the whole venue.
- [x] Friendly conflict message instead of a raw database error.
- [x] DB scenarios run inside a rolled-back transaction — no test data left behind (verified 0 rows).

## Phase 6 — manual booking + mandatory invoice
- [x] Manual booking is partner-only, scoped to the signed-in partner's own vendor id (RLS on `vendor_availability` / `vendor_invoices`).
- [x] Full field set: customer name + phone, event type, date, time, section (men/women/both), package/service, price, discount, VAT toggle, final total, payment status, notes.
- [x] Invoice is mandatory: no manual booking is saved without an issued invoice number; name, phone, event type and a positive price are required.
- [x] Invoice PDF carries provider establishment name, VAT number, CR/freelance on-file flag, customer name/phone, booking + invoice number, event type/date/time/section, package, price/discount/subtotal/VAT/total and payment status.
- [x] Provider name printed in the invoice corner (top-right) and footer.
- [x] Download-only PDF — no WhatsApp/SMS automation.
- [x] Availability stays the single source of truth; section statuses follow the chosen section, and the DB double-booking guard (0009) still blocks conflicts.
- [x] Typecheck, tests (8/8) and build pass.

## Phase 7 — packages / seasonal offers / reports / reviews
- [x] Migration 0010: packages gain sort_order, section, duration_hours, cancellation_policy, available_days, image_url, archived; pricing rules gain old_price, offer_price, terms, section, available_days, image_url.
- [x] Packages: create/edit/activate/deactivate/reorder; delete only when no booking references the package, otherwise archive (history preserved) with restore.
- [x] Seasonal offers: create + edit + activate/stop with old/offer price, auto discount %, section, available days, terms, image.
- [x] Reports already compute revenue/expenses/net/bookings/avg value/occupancy from real data with Excel export; partner-scoped.
- [x] Reviews: partner sees only own vendor reviews via SECURITY DEFINER RPC (display name only), reply/edit/delete under ownership RLS, reports go to admin moderation, profanity filter (no AI claim).
- [x] RLS verified in DB: another partner sees 0 rows and updates 0 rows on a partner's package; test row cleaned up.
- [x] Typecheck clean, tests 8/8, lint clean (pre-existing warnings only), build OK.

## Phase 8 — notifications
- [x] Partner-scoped feed (own vendor bookings/payments/reviews/profile/packages only); admin + customer notices filtered out.
- [x] New booking request = persistent ringing alert on every partner page, derived from `bookings.status = 'pending'` (not read state) — clears only on accept/reject. Verified in browser: visible while pending, gone after rejection.
- [x] Every notification links to its record (`partnerLinkFor`): bookings / reviews / reports / pricing / profile / calendar; clicking marks it read.
- [x] Unread counts + timestamps kept, realtime inserts on unique channels (layout + page listeners coexist).
- [x] Isolation verified in DB: another user's notification is invisible (0 rows) under RLS; partner data of a foreign vendor returns 0 across packages/offers/bookings/expenses/invoices/reviews.
- [x] No WhatsApp/SMS. Customer/Admin design untouched. Partner sidebar still five entries.
- [x] All QA data removed (temp vendor, booking, notifications, role) and vendor ownership restored.
- [x] Offer-expiry, calendar (confirmed events ≤ 7 days) and financial (uncollected balance) alerts added to the persistent partner alert strip, each linking to its section.
- [x] `getMyVendor` now takes the oldest profile deterministically instead of failing when an account owns several vendor profiles.
- [x] Gates re-run after last edit: typecheck clean, vitest 8/8, build OK, eslint 42 (6 pre-existing errors). Browser smoke desktop 1440 + mobile 375 with a real signed-in session: all partner pages load, alert strip renders all four alert types, alert navigates to /partner/bookings, no horizontal overflow.



## Phase 9+ (later, in order)
- [ ] Phase 9 — Customer Home visual refinement and full verification (current; Phase 10 not started).
- [ ] Remaining phases through final audit.
- [ ] Domain/DNS wiring deferred to the very end per user request.


