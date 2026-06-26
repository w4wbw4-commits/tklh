## الهدف
تخفيض زمن أول رسم (FCP) و LCP خصوصاً على الجوال، وتفادي التقطيع/التأخير عند فتح الصفحة الرئيسية.

## أسباب البطء الحالية (من فحص الكود)
1. **صورة `hero-mockup.png` = 2.2 ميغابايت** — هي عنصر LCP الأساسي، وتُحمَّل بصيغة PNG ثقيلة بدون نسخ متعددة.
2. **10 ملفات خط OTF** (Thmanyah Sans 5 + Serif Display 5) تُحمَّل بصيغة OpenType غير مضغوطة — حجم ضِعف woff2 تقريباً، وبدون `preload` للوزن الأساسي.
3. **لا يوجد `preload` لصورة الـ LCP ولا `preconnect`** إلى CDN الخطوط/الصور.
4. **خلفية الـ Hero مزدحمة**: تدرّجات + grain + 7 رسومات SVG (Curtains, Eucalyptus, Lotus, Candelabra ×2, Table, Banquet) تُرسم حتى على الجوال — تستهلك CPU/Paint.
5. **Marquee** يكرّر العناصر 4× مع `min-w-[200vw]` ويعمل بشكل دائم على صفّين — مكلف على الجوال.
6. **`ScrollProgress`** يعمل دائماً حتى على الجوال.
7. سكلتون التحميل للأقسام السفلية بارتفاع 80vh يسبّب “قفزة” بصرية مرئية للمستخدم.

## الخطة
### 1) صورة الـ Hero (الأثر الأكبر)
- ضغط `src/assets/hero-mockup.png` وإنتاج 3 نسخ: `hero-mockup.webp` (مكتبي ~1200px) + `hero-mockup-mobile.webp` (~720px) + إبقاء PNG كاحتياط.
- استخدام `<picture>` مع `srcset` + `sizes` و `loading="eager"` و `fetchpriority="high"` و `decoding="async"` و `width/height` لمنع CLS.
- إضافة `<link rel="preload" as="image" imagesrcset="..." imagesizes="..." fetchpriority="high">` في `index.html` للنسخة المناسبة.

### 2) الخطوط
- إبقاء الأوزان المستخدمة فعلياً فقط في `@font-face` الأولية: **Regular (400)** و **Bold (700)** لكل من Sans و Serif Display. باقي الأوزان (Light/Medium/Black) تبقى معرّفة لكن مع `font-display: optional` أو تُؤجَّل لتُحمَّل لاحقاً.
- إضافة `<link rel="preload" as="font" type="font/otf" crossorigin>` للوزنين الأساسيين فقط (Sans Regular + Serif Display Bold).
- إضافة `<link rel="preconnect">` لنطاق `/__l5e/` (CDN الخطوط).
- لاحقاً (اختياري) تحويل OTF إلى WOFF2 لتقليل الحجم ~٥٠٪.

### 3) خلفية الـ Hero
- إخفاء كل رسومات الـ SVG الزخرفية على الجوال (`hidden md:block` لجميعها بما فيها Curtains و Table).
- إزالة طبقة الـ grain (`backgroundImage: radial-gradient(...)`) على الجوال — أو خفض opacity إلى الصفر دون `sm`.
- استبدال `blur-3xl` بـ `blur-2xl` لتقليل تكلفة الـ filter.

### 4) Marquee
- تقليل التكرار من 4× إلى 2× وإزالة `min-w-[200vw]` (يكفي تكرار العناصر مع `display: inline-flex`).
- إيقاف الصف الثاني على الجوال (`hidden sm:block`) أو إبطاؤه أكثر، مع `prefers-reduced-motion: reduce` لإيقافه كلياً.

### 5) ScrollProgress
- عرضه فقط من `md` فأعلى عبر className، حتى لا يدور `scroll listener` على الجوال.

### 6) Skeletons
- خفض ارتفاع `SectionSkeleton` الافتراضي إلى `40vh` بدل `80vh` ليبدو الانتقال سلس.
- prefetch مبكر لقسم `ProblemSolutionAbout` عبر `import()` ديناميكي داخل `useEffect` بعد رسم الـ Hero (warm cache).

### 7) Vite build
- تأكيد أن `vite.config.ts` يستخدم `build.target: 'es2020'` و `cssCodeSplit: true` (تحقّق سريع، تعديل إن لزم).

## ملفات سيتم تعديلها
- `index.html` — preconnect + preload خط + preload صورة + meta.
- `src/index.css` — تخفيف `font-face` (display: optional للأوزان الثانوية).
- `src/components/tekillah/Hero.tsx` — `<picture>` متجاوبة، تخفيف الخلفية، Marquee مبسّط.
- `src/components/tekillah/ScrollProgress.tsx` — إخفاء على الجوال.
- `src/pages/Index.tsx` — تقليل ارتفاع السكلتون + prefetch.
- إضافة `src/assets/hero-mockup.webp` و `src/assets/hero-mockup-mobile.webp` (ناتجة من ضغط الصورة الحالية).

## النتيجة المتوقعة
- تخفيض حجم تحميل الصفحة الأولى من ~٣ ميغا إلى أقل من ٤٠٠ كيلو.
- تحسّن LCP على الجوال من ~٤–٦ ثوانٍ إلى أقل من ٢ ثانية على شبكة 4G.
- اختفاء “القفزات” البصرية وتأخر ظهور النصوص بسبب الخطوط.
