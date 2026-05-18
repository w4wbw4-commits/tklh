
UPDATE platform_packages SET
  price = 35000,
  sort_order = 3,
  name = 'الباقة الأساسية',
  description = 'كل ما تحتاجينه ليوم لا يُنسى — بسعر يريح بالك وخدمة تليق بفرحتك. بداية مثالية لعرس أنيق بدون أي تنازلات.',
  thumbnail_url = 'https://tircyaekosvrhzzegrbf.supabase.co/storage/v1/object/public/platform-package-media/essential.jpg'
WHERE id = 'efb2d3a2-c774-4cb9-9e0c-870b98f4897c';

UPDATE platform_packages SET
  price = 55000,
  sort_order = 2,
  name = 'باقة تِكله',
  description = 'تجربة الزفاف الكاملة كما تستحقينها — تنسيق متكامل، تفاصيل فاخرة، ولمسات تخطف الأنفاس. الباقة التي تحوّل يومك إلى أسطورة يتحدّث عنها الجميع.',
  thumbnail_url = 'https://tircyaekosvrhzzegrbf.supabase.co/storage/v1/object/public/platform-package-media/tekillah.jpg'
WHERE id = '9b1a2a9d-97e8-4ca4-854f-6e4e72c6c8b2';

UPDATE platform_packages SET
  price = 45000,
  sort_order = 1,
  name = 'الباقة المريحة',
  description = 'احتفلي وارتاحي — نتولّى كل صغيرة وكبيرة، وأنتِ فقط استمتعي. توازن مثالي بين الفخامة والراحة لعرس بلا قلق.',
  thumbnail_url = 'https://tircyaekosvrhzzegrbf.supabase.co/storage/v1/object/public/platform-package-media/comfort.jpg'
WHERE id = 'caecfdac-3e92-4038-9e6c-83fc26bddbb1';
