## التعديل المطلوب

إعادة إضافة الاسم الإنجليزي **TKLH** بخط **Cinzel** إلى الشعار، بحيث يصبح الشعار: أيقونة الكرسي + "تِكله" (عربي) + "TKLH" (إنجليزي بخط Cinzel). الشعار موحّد عبر مكوّن واحد `src/components/tekillah/Logo.tsx`، لذا التعديل يظهر تلقائياً في كل الصفحات (Navbar / Footer / كل المواضع).

## التخطيط البصري

```
[🪑 كرسي]  تِكله  TKLH
```

- **الكرسي**: أيقونة الكرسي الحالية من `src/assets/tklh-chair.png` (h-9 sm:h-10).
- **تِكله**: خط `font-wordmark` (Thmanyah Serif Display)، حجم `text-xl sm:text-2xl`، لون `primary-deep`.
- **TKLH**: خط `font-cinzel` (Cinzel من Google Fonts، مُحمّل مسبقاً في `index.html` ومُسجّل في `tailwind.config.ts`)، uppercase، tracking-[0.18em]، حجم متناسق `text-sm sm:text-base`، نفس لون `primary-deep`.
- الترتيب من اليمين لليسار في الواجهة العربية: الكرسي ← تِكله ← TKLH، بفواصل `gap-2`.

## الملف الوحيد المتأثر

- `src/components/tekillah/Logo.tsx` — إضافة `<span class="font-cinzel ...">TKLH</span>` بعد span الخاص بـ "تِكله" داخل نفس الـ `inline-flex items-center gap-2`.

لا حاجة لأي تعديل في Navbar أو Footer أو غيرها — جميعها تستهلك `<Logo />` مباشرة.
