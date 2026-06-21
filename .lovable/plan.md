## الهدف
تحويل صفحة الواجهة (`/`) إلى صفحة عرض فقط، ونقل الأقسام التفاعلية إلى صفحات مستقلة بروابط خاصة.

## الصفحات الجديدة

| المسار | المحتوى | المصدر الحالي |
|---|---|---|
| `/` | Hero + ProblemSolutionAbout + OccasionsSection + DashboardPreview + UpcomingFeatures + Mission + PaymentLogosStrip + Footer (عرض فقط) | `src/pages/Index.tsx` |
| `/packages` | قسم الباقات الكامل مع أزرار "احجز الآن" و"شف التفاصيل" | `PlatformPackages.tsx` |
| `/planner` | معالج التخطيط الذكي بخطواته الأربع | `PlanningWizard.tsx` |

## التغييرات

1. **`src/pages/Index.tsx`**
   - إزالة `PlatformPackages` و `PlanningWizard` من قائمة الـ lazy imports والـ JSX
   - استبدالهما بـ"بطاقتَي دعوة" (CTA cards) قصيرتَين:
     - بطاقة "اختر باقتك" → زر يوجّه إلى `/packages`
     - بطاقة "خطط ليلتك بنفسك" → زر يوجّه إلى `/planner`
   - الحفاظ على فواصل `SketchSectionDivider` والتسلسل البصري

2. **`src/pages/Packages.tsx`** (جديد)
   - Navbar + ScrollProgress + SEO (عنوان: "باقات تِكله")
   - عرض `<PlatformPackages />` بكامل تفاعله
   - Footer
   - زر رجوع للواجهة

3. **`src/pages/Planner.tsx`** (جديد)
   - Navbar + ScrollProgress + SEO (عنوان: "خطط ليلتك")
   - عرض `<PlanningWizard />` بكامل تفاعله
   - Footer
   - زر رجوع للواجهة

4. **`src/App.tsx`**
   - إضافة مسارين جديدين: `/packages` و `/planner` مع lazy loading

5. **`src/components/tekillah/Navbar.tsx`** و **`Footer.tsx`**
   - تحديث الروابط الداخلية: بدلاً من `#packages` و `#wizard` (anchors)، توجيه إلى `/packages` و `/planner`
   - الإبقاء على الروابط الأخرى كما هي

6. **أي أزرار CTA في الواجهة** (مثل أزرار Hero التي تنزل لـ wizard/packages) تُحوَّل إلى `Link` بدل scroll-to-anchor.

## نقاط للتأكيد

- IDs `#packages` و `#wizard` تُستبدل بمسارات بدل التمرير الداخلي.
- تبقى الترجمات (`ar.json` / `en.json`) كما هي — فقط الموقع يتغيّر.
- لا تعديل على منطق الـ wizard أو الباقات نفسه — فقط نقل مكان العرض.

## أسئلة قبل التنفيذ

- هل تريد بطاقتَي دعوة (CTA) مكان الأقسام المحذوفة في الواجهة، أم إزالتها تماماً والاكتفاء بروابط في الـ Navbar فقط؟
- هل تريد أن تبقى زر "ابدأ التخطيط" في Hero يفتح `/planner`، أم رابط آخر؟
