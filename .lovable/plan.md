# خطة التوحيد الشاملة للترجمة (AR / EN)

## الهدف
كل صفحة يشوفها العميل أو الشريك (Vendor/Partner) تعرض النصوص بالكامل حسب اللغة المختارة، مع نبرة إنجليزية «Corporate Premium» راقية، والحفاظ 100% على النصوص العربية الحالية كما هي بدون أي تغيير في الصياغة أو الخط.

## قواعد ثابتة
- **العربية تبقى كما هي حرفياً** — نسخ النصوص الحالية إلى ملف `ar.json` بدون تعديل كلمة.
- **الإنجليزية Corporate Premium** — «Plan & Book Now», «Get Started», «Continue», «Event Details», «Explore Packages»…
- **الخطوط**: العربية = Thmanyah / إنجليزية العناوين = Cinzel (مطبّق مسبقاً عبر `html[lang="en"]`).
- **الاتجاه**: مبدّل تلقائياً في `src/i18n/index.ts` — لا تغيير.
- **بدون كسر منطق أو تصميم** — فقط استبدال السلاسل النصية بمفاتيح `t()`.

## النطاق المتفق عليه
✅ صفحات العميل الكاملة + بوابة الشريك.
❌ لوحة الأدمن (`/admin/*` وملفات `admin/`) خارج النطاق حالياً.

## التنفيذ على 3 مراحل

### المرحلة 1 — الصفحات العامة للزائر (Marketing + Legal + SEO)
الملفات:
- `Hero.tsx`, `ProblemSolutionAbout.tsx`, `Mission.tsx`, `OccasionsSection.tsx`, `PlatformPackages.tsx`, `PaymentLogosStrip.tsx`, `Preloader.tsx`, `Footer.tsx`, `PartnerFloatingCTA.tsx`, `WhatsAppFloating.tsx`, `Logo.tsx`, `SiteMenuSheet.tsx`
- `pages/Index.tsx`, `pages/About.tsx`, `pages/Packages.tsx`, `pages/Vendor.tsx`, `pages/NotFound.tsx`
- `pages/Terms.tsx`, `pages/Privacy.tsx` (النصوص القانونية الطويلة تُنقل كمصفوفة إلى JSON)
- `pages/seo/WeddingsPage.tsx`, `EventsPage.tsx`, `ConferencesPage.tsx` (شامل meta titles/descriptions)
- `components/SEO.tsx` — قراءة العنوان/الوصف الافتراضي من `t()`.

### المرحلة 2 — مسار التخطيط والحجز والدفع
- `PlanningWizard.tsx` + `wizard/StepDetails.tsx`, `StepServices.tsx`, `StepVendors.tsx`, `StepVision.tsx`, `StepBudget.tsx`, `StepPackageDetail.tsx`, `BudgetHealthIndicator.tsx`, `wizard/types.ts` (labels الافتراضية)
- `pages/Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
- `pages/Checkout.tsx`, `Success.tsx`, `Invoice.tsx`
- `customer/*` (Dashboard, Timeline, GuestManager, InvitationDialog, PaymentsPanel, ReportIncidentDialog, EventDayMode…)
- `reviews/*` (RateBookingDialog, ReportDialog, ReviewsList, VendorRatingBadge)

### المرحلة 3 — بوابة الشريك (Vendor/Partner)
- كل `pages/vendor/Partner*.tsx` (Overview, Bookings, Calendar, Invoices, Sales, Analytics, Pricing, Checklists, Reviews, Notifications, Profile)
- `components/tekillah/vendor/*` (PortalLayout, PartnerHero, PartnerDashboardPreview, VendorBookings, VendorCalendar, VendorFinancials, VendorNotifications, VendorPortfolioManager, VendorProfileForm, VendorReviews, WelcomeDialog, StatusBanner, SmartCombobox, SmartPriceField, ExtraServicesPicker, ServiceTagsInput, saudiPlaces.ts, types.ts)

## التفاصيل التقنية
1. **بنية مفاتيح `ar.json` / `en.json`**: تفريعات حسب الصفحة/المكوّن — مثال `hero.title`, `wizard.details.city`, `partner.overview.kpi.revenue`, `legal.terms.sections[0].title`…
2. **استبدال النمط `isAr ? "…" : "…"`** بـ `t('key')` مع بقاء `useTranslation()` كما هو.
3. **قوائم البيانات** (المدن، أنواع المناسبات، الخدمات، فئات الموردين، تصنيفات الشكاوى…) → JSON dictionaries مفتاحها ID ثابت وقيمتها مترجمة، مع دالة helper `tList(prefix, ids)`.
4. **saudiPlaces.ts** — نضيف حقل `nameEn` لكل مدينة/حي (Riyadh, Jeddah, Dammam, Khobar, Al-Malqa, Al-Olaya…) ونختار الحقل حسب `i18n.language`.
5. **رسائل WhatsApp/التأكيد**: تُبنى بالكامل من مفاتيح مترجمة (مبدأ مطبّق جزئياً في `PlanningWizard`، يُعمَّم).
6. **SEO meta**: كل صفحة تمرّر `title`/`description` من `t()`؛ `<html lang>` تحدَّث تلقائياً.
7. **الأرقام والتواريخ**: توحيد عبر helper واحد في `src/i18n/format.ts` (يستخدم `Intl.NumberFormat` و`Intl.DateTimeFormat` مع `ar-SA`/`en-SA`).
8. **قاموس مصطلحات إنجليزية موحّد** (Style Guide مختصر داخل الـ PR):
   - Wedding / Marriage Contract Ceremony / Engagement / Graduation / Family Event / Opening Ceremony
   - Event Details · Event Type · Event Date · Male Guests · Female Guests
   - Plan & Book Now · Continue · Back · Previous · Next · Save Changes
   - Partner Portal · Overview · Bookings · Calendar · Invoices · Sales · Analytics · Pricing · Checklists · Reviews · Notifications · Profile
   - Coming Soon · Beta · Verified Partner
   - Slogan: **Relax — Teklah takes care of everything.**

## التحقّق
- بناء ناجح بعد كل مرحلة.
- تشغيل الصفحات الرئيسية بمحاكي Playwright في اللغتين والتقاط لقطات للتأكد أن التخطيط لا ينكسر (RTL/LTR، الأيقونات، سهم Back/Next).
- فحص أن `document.documentElement.lang` و`dir` صحيحان بعد التبديل.
- التأكد أن الخطوط: Cinzel للعناوين الإنجليزية، Thmanyah للعربية.

## المخرجات
- ملفّان محدّثان: `src/i18n/locales/ar.json` و `en.json` (توسعة كبيرة).
- ~70 ملف مكوّن/صفحة يستبدل النص المباشر بـ `t()`.
- helper `src/i18n/localized.ts` موسّع بدوال `tPlace`, `tService`, `tEventType`.
- لا تغيير على منطق الأعمال أو قاعدة البيانات.
