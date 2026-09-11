# خطة تغيير لون الشريط العلوي حسب لون الخلفية

## الهدف
جعل `Navbar` ثابتًا في الأعلى ولكنه يبدّل ألوانه تلقائيًا بحسب القسم الذي يظهر خلفه:
- الخلفية فاتحة (بيضاء/كريمية) → الشريط أخضر.
- الخلفية خضراء داكنة → الشريط كريمي/أبيض.

## الطريقة التقنية
1. **تمييز الأقسام بلونها**:
   - إضافة `data-navbar-theme="dark"` للأقسام ذات الخلفية الخضراء الداكنة (`UpcomingFeatures`, `Footer`).
   - إضافة `data-navbar-theme="light"` للأقسام ذات الخلفية الفاتحة (`Hero`, `ProblemSolutionAbout`, `OccasionsSection`, `Mission`).

2. **مراقبة التقاطع في `Navbar.tsx`**:
   - استخدام `IntersectionObserver` مع `rootMargin` يساوي ارتفاع الشريط العلوي تقريبًا.
   - عندما يقطع قسمٌ ما المنطقة التي يغطيها الشريط، يُحدَّث حالة `navbarTheme` إلى `light` أو `dark`.
   - عند وجود أكثر من قسم في المنطقة، يُعتمد القسم الأعلى (الأقرب إلى أعلى الشاشة).

3. **تطبيق الألوان حسب الحالة**:
   - حالة `light` (الشريط فوق خلفية فاتحة): خلفية خضراء (`--green` / `#163726`)، نص وحدود وآيقونات بلون كريمي (`--cream`).
   - حالة `dark` (الشريط فوق خلفية خضراء): خلفية كريمية (`--cream` / `#F1EBDD`)، نص وحدود وآيقونات بالأخضر (`--green`).
   - الانتقال بين الحالتين بسلاسة عبر `transition-colors duration-500`.

4. **تحديث عناصر الشريط**:
   - الخلفية والحدود الخارجية.
   - روابط التنقل وزر "خطط واحجز الآن" وأيقونة القائمة.
   - اللوقو: إذا كان اللوقو الحالي يعتمد على تباين معين، يُستخدم نسخة مناسبة أو يُترك بدون تغيير إذا كان شفافًا.

5. **التحقق**:
   - المعاينة على سطح المكتب والجوال.
   - التأكد من أن الانتقال يحدث عند التمرير فوق `UpcomingFeatures` و `Footer`، ويعود للأخضر فوق بقية الأقسام.

## الملفات المطلوب تعديلها
- `src/components/tekillah/Navbar.tsx`
- `src/pages/Index.tsx`
- `src/components/tekillah/UpcomingFeatures.tsx`
- `src/components/tekillah/Footer.tsx`
- `src/components/tekillah/ProblemSolutionAbout.tsx` (إضافة `data-navbar-theme="light"`)
- `src/components/tekillah/OccasionsSection.tsx` (إضافة `data-navbar-theme="light"`)
- `src/components/tekillah/Mission.tsx` (إضافة `data-navbar-theme="light"`)
