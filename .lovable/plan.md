# TKLH — Architectural Separation Plan (Customer / Partner / Admin)

Goal: separate the three experiences behind their own domains and put every database call behind a shared domain-service layer, so future iOS/Android apps reuse the same contracts. Zero visual, textual, functional, or data change.

Working assumption to confirm: Lovable publishes one app per project and maps custom domains to that app. So the separation is done **inside one codebase** with three app shells selected by hostname (`tklh.sa`, `partner.tklh.sa`, `admin.tklh.sa`), all backed by the single existing Cloud database. If you later want three fully independent deployments, the same structure lets each shell be lifted out without touching domain logic. If you prefer three separate Lovable projects immediately, say so — the phase order changes (shared code gets copied, not imported).

---

## 1. Current architecture map

Single Vite SPA. `src/App.tsx` holds one router with 30 routes covering public marketing, auth, customer dashboard, checkout/invoice, partner portal (11 routes), and admin (1 route with in-page tabs). One `AuthProvider`, one Supabase client, no route guards at the router level — each page checks auth itself.

Route groups today:
- Public/customer: `/`, `/about`, `/planner`, `/packages`, `/weddings`, `/events`, `/conferences`, `/terms`, `/privacy`, `/terms-of-service`, `/privacy-policy`, `/refund-policy`, `/dashboard`, `/checkout/:bookingId`, `/invoice/:bookingId`, `/success`, `/auth`, `/forgot-password`, `/reset-password`, `/vendor` (marketing + legacy portal), `/join-vendor`
- Partner: `/partner` + `/partner/{bookings,calendar,invoices,sales,analytics,pricing,checklists,reviews,notifications,profile}`
- Admin: `/admin`

Data access is spread across UI files: **90 `supabase.from` queries, 12 RPC calls, 4 Edge Function invokes, 22 storage calls, 18 auth calls, 2 realtime channels** — inside pages, dialogs, panels, and two lib helpers. Roles come from `user_roles` + `has_role()`, plus a hardcoded phone allowlist in `src/lib/admins.ts`. Edge Functions: `phone-otp`, `generate-invoice`, `generate-invitation`.

## 2. Route and component boundaries

```text
customer  →  marketing pages, planner wizard, /dashboard, checkout, invoice, success, auth, legal, SEO pages, /vendor + /join-vendor recruitment pages
partner   →  /partner/* (11 pages) + partner profile/onboarding
admin     →  /admin (all Admin* panels)
```

- Customer app owns: `Index`, `About`, `Planner`, `Packages`, SEO pages, legal pages, `Dashboard`, `Checkout`, `Invoice`, `Success`, `Auth`, `ForgotPassword`, `ResetPassword`, `Vendor` (marketing), `JoinVendor`, everything under `components/tekillah/customer` and `components/tekillah/wizard`.
- Partner app owns: `src/pages/vendor/*`, `components/tekillah/vendor/*` (`PortalLayout`, `StatusBanner`, `VendorCalendar`, `VendorBookings`, `VendorFinancials`, `VendorProfileForm`, `VendorPortfolioManager`, `VendorNotifications`, `VendorReviews`, pricing/invoice pages), `usePartnerVendor`.
- Admin app owns: `src/pages/Admin.tsx` and all 18 `components/tekillah/admin/*` files, `AdminLayout`, `AdminNotificationsBell`.

Legacy `/vendor` portal tabs stay exactly as they are on the customer domain during migration; the partner domain becomes the canonical portal only after Phase 5 verification.

## 3. Shared vs isolated

Safe to share (no behavior change): all 49 `components/ui/*` primitives, `src/index.css`, `tailwind.config.ts`, fonts/assets, `src/i18n/*`, `Logo`, `SEO`, `Reveal`, `EmptyState`, `AppErrorBoundary`, `RiyalSymbol`, `NumberStepper`, `lib/utils`, `lib/phone`, `lib/whatsapp`, `lib/profanity`, `lib/lazyWithRetry`, `hooks/use-mobile`, `hooks/use-toast`, `useAuth`, review primitives (`StarRating`, `ReviewsList`, `VendorRatingBadge`).

Must be isolated per app: `Navbar`, `SiteMenuSheet`, `Footer` (customer chrome), `PortalLayout` (partner chrome), `AdminLayout` (admin chrome), `RoleSwitcher` (admin-only tool, keep visible only on the admin shell and for allowlisted admins as today), `WhatsApp*` floating CTAs, `PartnerFloatingCTA`.

Currently mixed and needing a shared home: `components/tekillah/vendor/types.ts` (imported by `usePartnerVendor`, admin dialogs, wizard) and `components/tekillah/customer/types.ts` → move to `src/domain/*/types.ts` as re-exporting shims so no import breaks.

## 4. Direct database accesses needing a service boundary

Every call listed below moves behind a domain service. Same query text, same filters, same order — only the call site changes.

- **auth/users**: `Auth.tsx`, `Dashboard.tsx` (`profiles`), `RoleSwitcher`, `Footer`, `Navbar`, `Admin.tsx` (`user_roles`, `has_role`), `VendorProfileForm` (`user_roles` insert), `lib/admins`
- **vendors**: `Vendor.tsx`, `usePartnerVendor`, `get_vendor_private`, `AdminAddVendorDialog`, `AdminEditVendorDialog`, `AdminVendorsPanel`, `AdminVerificationQueue`, `admin_list_pending_vendor_*` RPCs, `vendors_public`, `vendor_ratings_summary`
- **events/timeline/guests**: `CreateEventDialog`, `EventCommandHeader`, `EventTimeline`, `EventOverview`, `OverviewSummary`, `GuestManager`, `Dashboard`, `finalisePlan`
- **bookings**: `BookingsTimeline`, `EventDayMode`, `PaymentsPanel`, `VendorBookings`, `PartnerOverview/Bookings/Analytics/Sales/Checklists`, `AdminPendingBookings`, `AdminLateAlerts`, `AdminVendorsPanel`, `AdminGrandControl`, `Checkout`, `Invoice`, `finalisePlan`
- **payments/invoices/settings**: `Checkout` (`payments`, `platform_settings_public`, `compute_payment_split`), `Invoice`, `PartnerInvoicesPage` (`vendor_invoices`), `Admin.tsx` (`payments`), `generate-invoice` function
- **packages**: `PlatformPackages`, `Packages`, `useMarketPrices`, `AdminPackagesPanel`, `AdminPackageDialog`, `StepVendors`
- **availability/pricing**: `VendorCalendar`, `PartnerPricingPage`, `AdminVendorsPanel`
- **reviews/moderation**: `RateBookingDialog`, `ReviewsList`, `ReportDialog`, `VendorReviews`, `AdminReviewsPanel`, `AdminModerationQueue`, `get_vendor_reviews`, `get_vendor_review_replies`
- **notifications**: `VendorNotifications`, `PartnerNotificationsPage`, `AdminNotificationsBell`, `AdminPendingBookings`, plus the 2 realtime channels
- **leads/applications/incidents/terms**: `lib/leads`, `StepComingSoon` + `AdminPlannerInterest` (`planner_interest`), `JoinVendor` + `AdminVendorApplications`, `ReportIncidentDialog` + `AdminIncidentReports`, `BookingsTimeline` (`emergency_requests`), `lib/terms`
- **storage** (22 calls): `vendor-documents`, `iban-documents`, `vendor-portfolios`, `platform-package-media`, `incident-attachments`, `vision-refs` → one `storage` service with per-bucket helpers
- **edge functions** (4 invokes): `phone-otp`, `generate-invoice`, `generate-invitation`

## 5. Recommended API/domain architecture

Modular monolith, API-first, no microservices, no second database.

```text
src/
  domain/                      ← the reusable contract layer (mobile reuses this)
    types.ts                   ← re-exports generated DB types, hand-written DTOs
    client.ts                  ← the single Supabase client re-export
    auth/        service.ts  types.ts
    users/       service.ts        (profiles, roles, allowlist)
    vendors/     service.ts
    events/      service.ts        (events, timeline, guests)
    bookings/    service.ts
    payments/    service.ts        (payments, invoices, settings, split)
    packages/    service.ts        (vendor packages + platform packages)
    availability/service.ts        (calendar, pricing rules)
    reviews/     service.ts        (reviews, replies, reports)
    notifications/service.ts       (queries + realtime subscribe)
    leads/       service.ts        (planner interest, customer leads, applications)
    incidents/   service.ts
    storage/     service.ts
    functions/   service.ts        (edge function invokes)
  apps/
    customer/ (routes.tsx, layout, pages)
    partner/
    admin/
  shared/  ui/, hooks/, i18n/, assets/, lib/
```

Each service exports plain async functions returning typed results and throwing typed errors — no React, no hooks, no framer-motion. That is the "API contract": a React Native or Swift client either imports these functions (JS/TS) or mirrors them against the same Supabase REST/RPC endpoints. Where a rule currently lives in a component (e.g. checkout split, invoice numbering), it moves into the service unchanged. Long-term, business rules that must not be client-trusted graduate to Edge Functions behind the same service signature, so callers never change.

## 6. Authentication / RBAC for three apps

One Supabase auth project, one session. Sessions are per-origin in browser storage, so a signed-in user on `tklh.sa` signs in separately on `partner.tklh.sa` — expected, and the sign-in UI is the existing one.

- Keep `useAuth` as-is; add `useRoles()` in `domain/users` that resolves `has_role` results plus the existing phone allowlist, memoized once per session instead of the current repeated per-component RPCs (`RoleSwitcher`, `Footer`, `Admin` each call it today).
- Add three guard components — `RequireCustomer`, `RequirePartner`, `RequireAdmin` — that reproduce today's redirect behavior exactly (partner pages currently redirect to `/auth?redirect=…`, admin currently checks `isAllowlistedAdmin` then `has_role`). No new lockouts: anything reachable today stays reachable.
- Server-side authority stays with RLS + `has_role()` security-definer functions. Guards are UX only.
- Cross-domain links: partner/admin apps link back to `tklh.sa` for marketing/legal; customer keeps its `/vendor`, `/join-vendor` recruitment pages.

## 7. Database / RLS strategy

No schema change, no policy change, no data migration in this restructure. One database, one auth, one storage. Existing policies, grants, triggers, and security-definer RPCs continue to be the security boundary — services call the same endpoints with the same role.

Only additive, optional follow-ups (separate approval, not part of this migration): a `mobile_devices` table for push tokens, and moving payment-split/invoice writes into Edge Functions. Both are additive-only, with GRANTs in the same migration.

## 8. Repository structure realistic for Lovable

One Lovable project, one build, three host-aware entries:

- `src/apps/{customer,partner,admin}/routes.tsx` each export a `<Routes>` fragment.
- `src/App.tsx` resolves the shell from `window.location.hostname`: `admin.` → admin shell, `partner.` → partner shell, everything else → customer shell. Localhost/preview keeps **all** routes mounted so nothing breaks in preview or the Lovable editor, and current URLs (`tklh.sa/partner`, `tklh.sa/admin`) keep working as aliases.
- Route-level code splitting stays as today (`lazyWithRetry`), so partner/admin chunks (recharts, xlsx, jspdf) still never load for customers.
- Subdomains are added in publish settings once the shells are verified.

No monorepo, no workspaces, no extra packages — folder moves plus a hostname switch.

## 9. Migration phases (safest order)

1. **Scaffold, no moves.** Create `src/domain/*` with empty services re-exporting the shared client. Nothing consumes them yet. Build must stay green.
2. **Extract services, one domain at a time**, in low-risk order: notifications → leads/applications → reviews → availability/pricing → packages → events/guests → vendors → bookings → payments/invoices → auth/users. Each step copies the exact query into the service and rewires call sites; verify per domain before the next.
3. **Storage + edge functions** behind `domain/storage` and `domain/functions`.
4. **Folder reorganisation** into `src/apps/*` and `src/shared/*` using path moves plus re-export shims so no import path breaks mid-flight; delete shims at the end.
5. **Host-aware shells.** Split routes into three `routes.tsx`, add hostname resolution, keep legacy paths as aliases. Add guards.
6. **Subdomain publish.** Point `partner.tklh.sa` and `admin.tklh.sa` at the app, verify all three hosts, keep old paths working.
7. **Optional hardening** (separate approval): shared role cache, Edge Functions for money paths, mobile-facing contract docs.

Safety: every phase is independently shippable and reversible; no phase changes SQL, RLS, copy, or styling. Rollback = revert that phase's edits, since the database is untouched throughout. Legacy paths and the legacy `/vendor` portal stay live until the final verification passes.

## 10. What must NOT be changed

Arabic/English copy, fonts and typography scale, colors and tokens (`#163726`, `#A7CAA1`, cream `#F1EBDD`, bronze `#A08553`), spacing/layout, animations, images and official logo files, i18n keys, existing route paths, database schema, RLS policies, grants, triggers, security-definer functions, existing rows, storage bucket names and privacy, Edge Function names and behavior, auto-generated files (`integrations/supabase/client.ts`, `types.ts`, `previewAuthStorage.ts`, `.env`, `supabase/config.toml`), and the admin phone allowlist.

## 11. Risks and compatibility

- **Query drift during extraction** — a rewritten filter or `order` silently changes results. Mitigation: copy query text verbatim; one domain per step.
- **Session per origin** — users must sign in again on each subdomain; phone-OTP flow must be verified on all three hosts.
- **Deep links and SEO** — old `/partner`, `/admin` paths must keep resolving; sitemap/robots and canonicals stay pointed at `tklh.sa` only.
- **Hostname switch in preview** — preview and editor run on a Lovable host, so the fallback must mount all routes or the editor loses pages.
- **Shared types moved** — `vendor/types.ts` is imported by admin and wizard code; shims prevent breakage.
- **Realtime channels** — the two subscriptions must be re-verified after being wrapped.
- **Bundle regressions** — check the partner/admin chunks still lazy-load after the shell split.
- **Admin allowlist trigger** — DB trigger grants roles by email pattern; keep `lib/admins.ts` values identical.

## 12. Verification checklist

Per phase, and again at the end:

- Build and typecheck clean; no new console/runtime errors.
- Customer: home, about, planner wizard end-to-end (event type, vision references upload, dates, submission), packages, SEO pages, legal pages, footer/menu, language toggle, navbar theme switching over green/cream sections.
- Auth: phone OTP send + verify, first-time profile completion, password reset, sign-out from the site menu, admin allowlist numbers still reach the admin console.
- Customer dashboard: event creation, timeline, guests, bookings timeline, payments panel, incident report, guest (unauthenticated) dashboard.
- Booking + payment: create booking from planner, checkout split totals identical to current values, success page, invoice page and `generate-invoice`, invitation generation.
- Partner portal: all 11 pages load with same data — overview, bookings accept/reject, calendar blocking, invoices, sales export, analytics charts, pricing rules, checklists, reviews + replies, notifications, profile save with document uploads and resubmit-on-edit behavior.
- Admin console: every panel — leads/planner interest with filters and notes, signups, vendors, verification queue, packages, pending bookings, late alerts, incidents, moderation, reviews, vendor applications, notification bell with realtime badge.
- Notifications: booking request/confirm/payment triggers still deliver to customer, partner, and admins.
- Storage: uploads and signed reads for all six buckets.
- Responsive pass at 375 / 768 / 1440 with pixel comparison against pre-migration screenshots.
- Hosts: `tklh.sa`, `partner.tklh.sa`, `admin.tklh.sa` each serve the right shell; legacy `/partner` and `/admin` paths still work.
