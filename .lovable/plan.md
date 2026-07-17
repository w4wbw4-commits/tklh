# خطة التنفيذ

## الهدف
استبدال أول بطاقة في المعرض (`Gallery.tsx`) بفيديو سينمائي هادئ مدته ~10 ثواني يعرض تجهيز المناسبة، مع تكرار سلس بدون تقطيع، ووضوح عالٍ على الجوال. وإعادة توليد الصور الثلاث المتبقية بجودة فوتوغرافية واقعية 100%.

## 1) توليد الفيديو الافتتاحي
- الأداة: `videogen--generate_video` (Seedance عبر Lovable AI).
- المواصفات:
  - `aspect_ratio: "9:16"` (عمودي للجوال)
  - `resolution: "1080p"`
  - `duration: 10` ثوانٍ
  - `camera_fixed: true` (لتقليل الاهتزاز وتسهيل التكرار السلس)
- المسار: `public/gallery/hero-prep.mp4`
- الـ prompt سيغطي 4 مشاهد سينمائية بطيئة تنتقل بسلاسة:
  1. لمسة أخيرة على كوشة أعراس فاخرة بالورد الأبيض والذهبي
  2. دخان بخور يتصاعد ببطء في قاعة بإضاءة ذهبية دافئة
  3. ترتيب صواني القهوة العربية والتمر والحلا على بوفيه أنيق
  4. يد بثوب أبيض تقدّم فنجان قهوة عربية لضيف بأناقة
- تلميحات لضمان التكرار السلس بدون قطع: بداية ونهاية بلقطة هادئة متشابهة (fade-friendly)، حركة كاميرا بطيئة جداً، إضاءة ثابتة، بدون قصات حادة.

## 2) إعادة توليد الصور بجودة واقعية 100%
باستخدام `imagegen--generate_image` بنموذج `premium` (Gemini 3 Pro Image) للحصول على واقعية فوتوغرافية عالية.
- `public/gallery/corporate.jpg` — مؤتمر سعودي فاخر، إضاءة طبيعية، تفاصيل واقعية
- `public/gallery/catering.jpg` — بوفيه ضيافة سعودي واقعي (قهوة عربية، تمر، حلا)، إضاءة ذهبية طبيعية
- `public/gallery/photography.jpg` — مصور محترف يوثق مناسبة، لقطة كواليس واقعية
- كل الـ prompts ستؤكد: `photorealistic, shot on medium format camera, natural lighting, no illustration, no CGI, real Saudi setting`.

## 3) تعديل مكوّن `Gallery.tsx`
- إضافة حقل اختياري `videoSrc?: string` إلى نوع `GalleryItem`.
- جعل أول عنصر (Weddings) يحمل `videoSrc: "/gallery/hero-prep.mp4"`.
- في الشبكة: إذا كان العنصر يحوي `videoSrc` نعرض `<video>` بدل `<img>` بالخصائص:
  - `autoPlay muted loop playsInline preload="metadata"`
  - `poster={item.src}` (لعرض صورة أثناء التحميل — يبقي التصميم سليم)
  - `object-cover w-full h-full` بنفس نسبة `aspect-[4/5]` الحالية
  - نفس التراكب الزيتوني والعنوان الذهبي (بدون أي تغيير بصري بالتصميم)
- الفوائد: تكرار سلس (`loop`)، بدون صوت، تشغيل مضمون على iOS (`playsInline muted`)، تحميل خفيف (`preload="metadata"`).

## 4) ملاحظات فنية
- نُبقي `public/gallery/weddings.jpg` كصورة `poster` احتياطية لبطاقة الفيديو (سرعة عرض أعلى + fallback).
- لا تغييرات على باقي الصفحات أو الألوان أو الخطوط.
- بعد التنفيذ سأتحقق من الحجم والتشغيل التلقائي على الجوال.

## الملفات المتأثرة
- ✏️ `src/components/tekillah/Gallery.tsx` (إضافة دعم فيديو للعنصر الأول)
- ➕ `public/gallery/hero-prep.mp4` (فيديو جديد ~10s، 9:16، 1080p)
- 🔁 `public/gallery/corporate.jpg` (إعادة توليد واقعي)
- 🔁 `public/gallery/catering.jpg` (إعادة توليد واقعي)
- 🔁 `public/gallery/photography.jpg` (إعادة توليد واقعي)
