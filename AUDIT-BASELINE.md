# TKLH — Final Baseline Audit (Phase 0, read-only)
Date: 2026-09-17 · No code or database changes were made.
Build status at audit time: `build OK`.

Legend: ✅ COMPLETED · 🟡 PARTIAL · ❌ MISSING

## 1. Architecture, routing, boundaries
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1.1 | Host-aware shells (tklh.sa / partner. / admin.) | ✅ | `src/apps/shell.ts:16-23`, `src/App.tsx:56-89` |
| 1.2 | Legacy `/partner`, `/admin` still work; preview mounts all | ✅ | `src/App.tsx:79-88` |
| 1.3 | Lazy loading preserved | ✅ | `src/apps/*/routes.tsx` (`lazyWithRetry`) |
| 1.4 | No customer→partner/admin component imports | ✅ | grep: no `pages/vendor` / `pages/Admin` imports outside partner/admin routes |
| 1.5 | All DB access behind typed domain services | ✅ | only `src/domain/client.ts` imports the client |
| 1.6 | Storage access isolated | ✅ | `src/domain/storage/service.ts`; zero `supabase.storage` calls elsewhere |
| 1.7 | Edge functions isolated | ✅ | `src/domain/functions/service.ts:7-14` |
| 1.8 | Six partner routes exist with no menu entry (calendar, invoices, sales, analytics, pricing, checklists) | 🟡 risk | `src/apps/partner/routes.tsx:25-30` — duplicate surfaces for Bookings/Reports |

## 2. Auth / RBAC / RLS
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 2.1 | RLS enabled on all public tables | ✅ | all 28 tables `relrowsecurity = true` |
| 2.2 | Roles in separate `user_roles` + `has_role()` | ✅ | policies verified; `user_roles` writable only by admins |
| 2.3 | Frontend allowlist not a substitute for RLS | 🟡 | `src/lib/admins.ts`, `src/domain/users/service.ts:27-36` auto-calls `ensureRole`; harmless because RLS blocks the insert and the DB trigger `auto_grant_primary_admin` is the real grant — but logic is duplicated in `src/pages/Auth.tsx:44-49` |
| 2.4 | Phone login + password + forgot password | 🟡 | phone+OTP via edge function (`src/pages/Auth.tsx:104-189`); password is server-minted, user never types one; reset is email-based (`src/pages/ForgotPassword.tsx`) |
| 2.5 | Real SMS delivery | ❌ external | `supabase/functions/phone-otp/index.ts:13,109` — `PHONE_OTP_DEV_ECHO` returns the code in the response; no SMS provider |
| 2.6 | Vendor registration + admin approval | ✅ | `src/pages/JoinVendor.tsx:59-100` → `vendor_applications`; approval gates `vendors.approval_status` |
| 2.7 | `phone_otp_challenges` RLS enabled with 0 policies (locked, intentional) | ✅ | linter INFO 0008 |
| 2.8 | 59 linter warnings: SECURITY DEFINER functions executable by anon/authenticated | 🟡 risk | most are triggers (harmless), but `admin_list_*`, `compute_payment_split`, `refresh_booking_availability`, `generate_vendor_invoice_number` are anon-callable; the admin ones self-check `has_role` |
| 2.9 | Edge functions `verify_jwt = false` with no caller validation | 🟡 risk | `generate-invoice/index.ts:25-29` and `generate-invitation/index.ts:10-16` accept any body — no ownership check; invitation burns AI credits for anonymous callers |

## 3. Booking / availability / cancellation
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 3.1 | Cancel = preserved state, never delete | ✅ | `src/domain/bookings/service.ts:56-89` |
| 3.2 | Mandatory reason + confirm modal | ✅ | `VendorBookings.tsx:304-359`; customer side `BookingsTimeline.tsx` |
| 3.3 | Actor / role / timestamp stored | ✅ | migration `0003_add_booking_cancellation_fields.sql` |
| 3.4 | Cancel reopens only the cancelled section | ✅ | DB `refresh_booking_availability` recomputes men/women per real bookings; verified earlier with live SQL test |
| 3.5 | Pending rejection leaves no ghost hold | ✅ | same trigger path (`sync_booking_availability`) |
| 3.6 | Single source of truth shared with customer search | ❌ | `vendor_availability` is never read by customer code; `listPublicVendorsForWizard` (`src/domain/vendors/service.ts:188-196`) filters only active/approved/category — no date filter. The live wizard ends at `StepComingSoon` (lead capture), so no date-based catalog exists yet |

## 4. Partner portal
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 4.1 | Logo + chair + collapsible sidebar + language + status light | ✅ | `PortalLayout.tsx:96-202` |
| 4.2 | Title "لوحة تحكم الشريك" on all partner pages | ❌ | string absent; only `badge="لوحة الشريك"` on Overview (`PartnerOverview.tsx:134`) |
| 4.3 | Notifications fixed top-left on every page | ✅ | `PortalLayout.tsx:219-231` |
| 4.4 | Sidebar exactly 5 items | ✅ visible / 🟡 routes | `PortalLayout.tsx:35-41` + orphan routes (1.8) |
| 4.5 | Overview: occupancy, revenue, confirmed, calendar | ✅ | `PartnerOverview.tsx:148-238` |
| 4.6 | Overview: reviews metric + upcoming bookings | ❌ | rating hardcoded `"—"` (`:151`); no upcoming list |
| 4.7 | Bookings page = requests + calendar/manual + packages | ✅ | `PartnerBookings.tsx:26-51` |
| 4.8 | Calendar colours + today cream/yellow ring + section split only when supported | ✅ | `VendorCalendar.tsx:411-491` |
| 4.9 | Manual booking → mandatory invoice + PDF | ✅ | `VendorCalendar.tsx:194-320` |
| 4.10 | Invoice fields: CR/freelance doc + payment status on the manual PDF | 🟡 | present on `PartnerInvoicesPage.tsx:72` PDF, absent from the manual-booking PDF |
| 4.11 | No WhatsApp API | ✅ | none in repo |
| 4.12 | Packages: edit/enable/disable/delete/price/services/publish state | ✅ | `VendorPackagesManager.tsx:66-233` |
| 4.13 | Packages: per-package images/video, duration, section, cancellation policy, reorder | ❌ | media is vendor-wide only (`:295-302`) |
| 4.14 | Seasonal offers: old/new price, services, terms, days, section | 🟡 | only label + % + dates + active (`:140-170`) |
| 4.15 | Reports: revenue/expenses/net/counts/avg/occupancy + Excel (3 sheets) | ✅ | `PartnerReportsPage.tsx:110-231` |
| 4.16 | Reviews + replies + profanity moderation both sides | ✅ | `ReviewsList.tsx:100`, `RateBookingDialog.tsx:36`, `src/lib/profanity.ts` |
| 4.17 | Profile: data, docs, prices incl. men/women sections, VAT, booking settings | ✅ | `VendorProfileForm.tsx:60-92` |
| 4.18 | Booking-request alert persists until the request is acted on | ❌ | bell counts `notifications.read` only (`notifications/service.ts:52-66`); "mark all read" clears it while the booking is still pending |
| 4.19 | Partner sees only own data | ✅ | RLS on bookings/packages/vendor_* scoped via `vendors.user_id = auth.uid()` |

## 5. Customer Home
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 5.1 | Warm neutral palette, scoped, no CSS leakage | ✅ | `src/styles/home.css` — every rule under `.customer-home` |
| 5.2 | Brand green preserved | 🟡 | `--home-brand: 149 43% 15%` vs spec `151 43% 15%` (2° hue drift) |
| 5.3 | Typography system from Cerimonia reference | ✅ | `home.css` heading/body scale |
| 5.4 | Fluid `clamp()` sizing | 🟡 | no `clamp()`; sizing via breakpoint rules and Tailwind classes — result is responsive but stepped |
| 5.5 | Content/images/logo untouched | ✅ | no content diffs outside styling |

## 6. External blockers (cannot be done inside Lovable)
1. DNS for `partner.tklh.sa` and `admin.tklh.sa`.
2. Licensed SMS provider (Unifonic / Twilio) for real OTP delivery.
3. WhatsApp Business API for automatic invoice delivery (deferred by request).

## Suggested execution order for later phases
1. Security: lock the two open edge functions; review anon-executable SECURITY DEFINER grants.
2. Availability ↔ customer search: single source of truth (date + section filter in the public vendor query).
3. Partner: persistent pending-booking alert; "لوحة تحكم الشريك" header; Overview reviews + upcoming bookings.
4. Partner: package media/duration/section/cancellation policy/reorder; richer seasonal offers.
5. Manual invoice PDF: add CR/freelance document + payment status.
6. Cleanup: fold or remove the six unlinked partner routes.
7. Customer Home: brand hue to `151 43% 15%`, optional `clamp()` pass.
