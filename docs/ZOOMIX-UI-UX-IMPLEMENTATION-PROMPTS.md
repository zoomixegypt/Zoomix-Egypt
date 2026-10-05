# ZOOMIX — UI / UX Implementation Prompts

هذا الملف يحتوي على Prompts تنفيذية مرتبة لتطبيق كل ما ورد في:

`docs/ZOOMIX-UI-UX-IMPROVEMENT-PLAN.md`

## قواعد عامة قبل كل Prompt

- نفّذ Prompt المطلوب فقط ولا تنتقل تلقائيًا إلى التالي.
- حافظ على هوية ZOOMIX الحالية: الأسود، الليموني `#BBFF00`، الأبيض، والـOff-white.
- لا تعُد إلى هوية MotionFolio أو أي ملفات موجودة داخل `Unused`.
- لا تضف أرقامًا أو نتائج أو Testimonials غير موثقة.
- لا تغيّر الأسعار أو مخرجات الباقات إلا بتوجيه صريح.
- حافظ على العربي والإنجليزي وRTL / LTR.
- لا تنفذ Commit أو Push أو Deploy إلا بعد موافقة صريحة.
- بعد كل Prompt شغّل:
  - `npm run format:check`
  - `npm run build`
  - `/usr/bin/git diff --check`
- أرسل ملخص الملفات المعدلة ونتيجة الاختبارات قبل الانتقال للـPrompt التالي.

---

## Prompt 00 — Baseline Audit

```text
نفّذ مراجعة Baseline للموقع قبل أي تعديل.

راجع:
- بنية الصفحة الحالية.
- ترتيب الأقسام.
- Navbar وMobile Menu.
- Hero واللوجو.
- الخدمات والأعمال والباقات وProcess وFAQ.
- Project Modal وRoutes.
- Project Brief وWhatsApp.
- Footer وروابط السوشيال.
- العربي والإنجليزي وRTL / LTR.
- Responsive على Desktop وMobile.
- Accessibility.
- Performance وSEO.

لا تعدّل أي ملف في هذه المرحلة.

أرسل:
1. الملفات ذات الصلة.
2. المشاكل المؤكدة.
3. المشاكل المحتملة.
4. أولويات الإصلاح.
5. أوامر الاختبار المستخدمة.
```

### معيار الإغلاق

- لا توجد تعديلات غير مقصودة.
- توجد قائمة مشاكل مرتبة حسب الأولوية.
- تم تسجيل الحالة قبل بدء التنفيذ.

---

## Prompt 01 — Page Order and Conversion Flow

```text
أعد ترتيب الصفحة الرئيسية لتحسين تجربة التحويل.

الترتيب المطلوب:
Hero → Marquee → Services → Work → Packages → Process / FAQ → Project Brief → Footer.

المطلوب:
- نقل قسم الأعمال قبل قسم الباقات.
- الحفاظ على جميع IDs الحالية أو تحديث روابط Navbar وFooter بأمان.
- الحفاظ على Lazy Loading بدون ظهور فراغات مزعجة.
- الحفاظ على Scroll behavior وLenis.
- التأكد من أن أزرار Hero تصل إلى Work وProject Brief الصحيحين.
- عدم تغيير النصوص أو الأسعار في هذه المرحلة.

بعد التنفيذ اختبر:
- التنقل من Navbar.
- روابط Footer.
- زر View Work.
- زر Start a Project.
- Refresh على الصفحة الرئيسية.
```

### معيار الإغلاق

- الأعمال تظهر قبل الباقات.
- كل روابط الأقسام تعمل.
- لا يوجد قسم فارغ أو Route مكسور.

---

## Prompt 02 — Desktop Navbar Simplification

```text
حسّن Navbar على Desktop وTablet بدون تغيير الهوية.

راجع ازدحام Navbar عند 1024px و1280px.

المطلوب:
- اجعل الروابط الأساسية: عن زومكس، الخدمات، الأعمال، تواصل.
- انقل الباقات وطريقة العمل إلى Mobile Menu أو روابط داخل الصفحة حسب التصميم الأنسب.
- حافظ على زر اللغة وCTA الرئيسي.
- قلّل padding والمسافات فقط عند الحاجة.
- أضف Active state للقسم الحالي إذا كان ذلك آمنًا.
- لا تجعل Navbar يغطي عناوين الأقسام.
- حافظ على اللوجو الحقيقي SVG.

اختبر:
- 1024px.
- 1280px.
- 1440px.
- العربي والإنجليزي.
```

### معيار الإغلاق

- لا يوجد تداخل بين Navbar والـCTA.
- اللوجو واللغة والـCTA ظاهرة.
- روابط الأقسام الأساسية تعمل.

---

## Prompt 03 — Mobile Header and Hero QA

```text
راجع Mobile Header وHero مراجعة دقيقة.

المطلوب:
- حافظ على اللوجو الحقيقي في الـNavbar.
- تأكد أن اللوجو لا يختفي على الخلفية الداكنة أو الفاتحة.
- راجع Safe Area في أجهزة iPhone.
- اختبر ارتفاع الـHero على 320px و375px و390px و430px.
- امنع قص العنوان العربي أو خروجه أفقيًا.
- اجعل CTA الأساسي ظاهرًا بدون Scroll إضافي.
- لا تستخدم tracking سالب قوي مع العربي.
- اجعل اتجاه الأسهم متوافقًا مع RTL / LTR.
- لا تضف مساحة فارغة غير مبررة أعلى أو أسفل الـHero.
```

### معيار الإغلاق

- لا يوجد horizontal overflow.
- لا يوجد قص للنص أو الأزرار.
- اللوجو ظاهر في كل الحالات.
- Hero واضح على الموبايل.

---

## Prompt 04 — Project Gallery Discovery and Controls

```text
حسّن اكتشاف واستخدام قسم الأعمال على Desktop وMobile.

المطلوب:
- أضف توجيهًا واضحًا للسحب الأفقي مثل: اسحب للمزيد / Scroll to explore.
- حسّن عداد المشاريع والمؤشر الحالي.
- أضف أزرار السابق والتالي إذا لم تؤثر على التصميم.
- حافظ على Native horizontal scroll في الموبايل.
- لا تجعل المستخدم عالقًا داخل Pinned Scroll على Desktop.
- أضف fallback واضحًا عند Reduced Motion.
- أضف Focus state واضح للكروت.
- حافظ على الصور الحالية وأوصافها.
```

### معيار الإغلاق

- يعرف المستخدم أن هناك مشاريع إضافية.
- يمكن الوصول لكل مشروع بالماوس واللمس والكيبورد.
- Reduced Motion يعمل بدون تجربة مكسورة.

---

## Prompt 05 — Accessible Project Cards

```text
حسّن Accessibility لكروت المشاريع.

المطلوب:
- استبدل role=button غير الضروري بعنصر Button مناسب، أو اجعل التفاعل مطابقًا لمتطلبات Button.
- دعم Enter وSpace.
- أضف aria-label واضح لكل بطاقة.
- أضف Focus-visible state.
- لا تغيّر سلوك فتح المشروع.
- حافظ على فتح Modal عند استخدام Mouse أو Touch.
- اختبر ترتيب Tab.
```

### معيار الإغلاق

- يمكن فتح كل مشروع بدون ماوس.
- Enter وSpace يعملان.
- التركيز واضح بصريًا.
- لا توجد تحذيرات Accessibility واضحة في العناصر التفاعلية.

---

## Prompt 06 — Project Modal UX and Focus Management

```text
طوّر تجربة Project Modal.

المطلوب:
- أضف aria-modal=true.
- أضف role=dialog أو semantic مناسب.
- انقل التركيز لأول عنصر عند الفتح.
- امنع خروج التركيز إلى الصفحة الخلفية.
- أعد التركيز إلى بطاقة المشروع بعد الإغلاق.
- حافظ على Escape للإغلاق.
- أضف زر Back to Work بجانب Close إذا كان ذلك مناسبًا.
- اجعل الإغلاق من Route مباشر يعيد المستخدم إلى الصفحة الرئيسية بأمان.
- أضف Previous / Next project إن لم يسبب تعقيدًا بصريًا.
- اجعل عنوان الصفحة يتغير حسب المشروع.
- وضّح بصريًا أن المشروع Concept إذا لم تكن هناك نتائج موثقة.
```

### معيار الإغلاق

- Modal قابل للاستخدام بالكامل بالكيبورد.
- لا يحدث فقدان للتركيز.
- Escape وClose وBack تعمل.
- Refresh على Route المشروع لا ينتج صفحة فارغة.

---

## Prompt 07 — Package Comparison UX

```text
حسّن قسم الباقات بدون تغيير الأسعار أو المخرجات.

الأسعار الثابتة:
- Start = 6,000 جنيه.
- Launch = 11,000 جنيه.
- Launch + Content = 15,000 جنيه.

المطلوب:
- أظهر الفرق الأساسي بين الباقات بسرعة.
- حافظ على الباقة المقترحة.
- أضف مقارنة مختصرة أو مميزات أساسية.
- على الموبايل اجعل التفاصيل الطويلة داخل Accordion إذا كان ذلك أوضح.
- حافظ على المدة والاستثناءات والدفع 60% / 40%.
- لا تجعل المقارنة تكرر نفس النصوص بشكل مرهق.
- حافظ على اختيار الباقة والانتقال إلى Project Brief.
```

### معيار الإغلاق

- يستطيع المستخدم مقارنة الباقات في أقل من دقيقة.
- الأسعار والمخرجات لم تتغير.
- اختيار الباقة يصل للنموذج بشكل صحيح.

---

## Prompt 08 — Mobile Project Brief

```text
حسّن نموذج Project Brief للموبايل.

المطلوب:
- قلّل الحقول الإجبارية إلى الاسم، الهاتف، نوع الخدمة، والوصف، أو نفّذ Progressive Disclosure.
- حافظ على باقي الحقول كاختيارية.
- اجعل النموذج مناسبًا للاستخدام بيد واحدة.
- لا تجعل زر WhatsApp يغطي الحقول أو لوحة المفاتيح.
- أضف required للحقول الإجبارية.
- اربط رسائل الخطأ بالحقول باستخدام aria-describedby.
- أظهر بوضوح ما سيحدث بعد الضغط.
- احتفظ برسالة WhatsApp الحالية وبالرقم +201555451535.
- أضف fallback لنسخ الرسالة إذا لم يفتح WhatsApp.
- لا تحفظ بيانات حساسة على Server.
```

### معيار الإغلاق

- يمكن إكمال النموذج على شاشة 375px بسهولة.
- الأخطاء واضحة.
- واتساب يفتح بعد Submit فقط.
- يوجد fallback عند فشل الفتح.

---

## Prompt 09 — Arabic Typography and Direction

```text
راجع Typography العربي والاتجاهات.

المطلوب:
- استخدم tracking-normal للعناوين العربية.
- ارفع line-height للعناوين العربية الطويلة عند الحاجة.
- راجع كل الأزرار والأسهم في RTL وLTR.
- وحّد كتابة Brief وReels وLanding Page وRaw Files.
- تأكد من عدم تداخل الحروف أو علامات الترقيم.
- لا تغيّر الخطوط المعتمدة خارج الهوية.
- اختبر تغيير اللغة من Navbar ومن Mobile Menu.
```

### معيار الإغلاق

- العربي مقروء على كل المقاسات.
- الأسهم والـCTA في الاتجاه الصحيح.
- تبديل اللغة لا يسبب Layout shift مزعج.

---

## Prompt 10 — Accessibility Pass

```text
نفّذ Accessibility pass شامل.

راجع:
- ترتيب Tab.
- Focus-visible.
- Skip link.
- Buttons وLinks.
- Project Modal.
- FAQ Accordion.
- Project Brief errors.
- Contrast.
- Reduced Motion.
- Floating WhatsApp.

أصلح فقط المشاكل المؤكدة، ولا تغيّر التصميم بدون سبب وظيفي.

أرسل قائمة بالمشاكل قبل وبعد الإصلاح.
```

### معيار الإغلاق

- الموقع قابل للاستخدام بالكيبورد.
- العناصر المهمة لها أسماء واضحة.
- رسائل الخطأ مفهومة.
- لا توجد حركة إجبارية مع Reduced Motion.

---

## Prompt 11 — Loading and Performance UX

```text
حسّن تجربة التحميل والأداء.

المطلوب:
- استبدل Suspense الفراغي بـSkeleton مناسب للون كل قسم.
- أضف fallback للصور الفاشلة.
- حافظ على أبعاد الصور لمنع CLS.
- راجع Lazy Loading للصور والأقسام.
- لا تشغّل Noise أو Motion غير ضروري على Touch أو Reduced Motion.
- حسّن SVGs بدون فقدان الهوية.
- راجع تحميل الخطوط.
- لا تضف مكتبات جديدة إلا عند الحاجة الفعلية.
```

### معيار الإغلاق

- لا تظهر فراغات مفاجئة أثناء التحميل.
- لا يحدث Layout shift واضح.
- لا تتأثر الهوية البصرية.
- Build ينجح بدون أخطاء.

---

## Prompt 12 — SEO and Project Metadata

```text
حسّن SEO بدون تغيير المحتوى التجاري.

المطلوب:
- أضف Title وDescription مستقلين لكل Project Route.
- أضف Canonical مناسب لكل Route.
- أضف OG image مستقلة إذا كانت الصور متاحة.
- راجع sitemap وrobots.
- أضف Breadcrumbs مفيدة داخل صفحات المشاريع.
- أضف وصف عربي مناسب للصفحة العربية.
- راجع JSON-LD.
- لا تدّعِ نتائج أو عملاء غير موثقين.

إذا كان SEO العربي والإنجليزي يتطلب Routes مستقلة، اقترح البنية أولًا ولا تنفذها بدون مراجعة.
```

### معيار الإغلاق

- كل Route مهم له Metadata صحيحة.
- لا توجد Canonical متعارضة.
- Sitemap يعكس Routes الحقيقية.

---

## Prompt 13 — Trust and Conversion Content

```text
حسّن محتوى الثقة والتحويل باستخدام بيانات موثقة فقط.

راجع إمكانية إضافة:
- Client logos.
- Testimonials حقيقية.
- أمثلة قبل / بعد.
- قطاعات تم العمل معها.
- وقت الرد المتوقع.
- توضيح Concept Projects.

لا تخترع أي رقم أو اسم عميل أو نتيجة.

أضف فقط ما يمكن إثباته من ملفات المشروع أو من بيانات يزودها المستخدم.
```

### معيار الإغلاق

- كل عنصر ثقة له مصدر واضح.
- لا توجد Claims مبالغ فيها.
- النصوص تساعد القرار ولا تزيد الزحام.

---

## Prompt 14 — Analytics Preparation

```text
جهّز خطة Analytics بدون إرسال بيانات إلى خدمة خارجية الآن.

حدد Events للأفعال التالية:
- Start a Project.
- View Work.
- Open Project.
- Choose Package.
- Start Brief.
- Validation Error.
- Send to WhatsApp.
- Social link click.
- Language change.
- Reach Project Brief.

أرسل:
1. أسماء الأحداث.
2. البيانات غير الحساسة المقترحة لكل حدث.
3. مواضع إطلاق الأحداث.
4. أي مخاطر خصوصية.

لا تضف SDK أو Tracking فعلي قبل موافقة المستخدم.
```

### معيار الإغلاق

- توجد Event taxonomy واضحة.
- لا يتم إرسال بيانات شخصية بدون موافقة.
- لا يوجد SDK جديد مضاف تلقائيًا.

---

## Prompt 15 — Full Responsive QA

```text
نفّذ Responsive QA شامل على المقاسات التالية:

- 320px.
- 375px.
- 390px.
- 430px.
- 768px.
- 1024px.
- 1280px.
- 1440px وما فوق.

راجع:
- اللوجو.
- Navbar.
- Mobile Menu.
- Hero.
- Marquee.
- Services.
- Work.
- Packages.
- Process.
- FAQ.
- Project Brief.
- WhatsApp.
- Footer.
- Project Modal.

ابحث عن:
- Horizontal overflow.
- Text clipping.
- Buttons خارج الشاشة.
- Fixed elements تغطي المحتوى.
- مشاكل Landscape.
- مشاكل تغيير اللغة.

أصلح المشاكل المؤكدة فقط، ثم أرسل نتائج كل مقاس.
```

### معيار الإغلاق

- لا يوجد كسر في المقاسات الأساسية.
- لا توجد أزرار غير قابلة للاستخدام.
- الموبايل والـDesktop لهما تجربة متوازنة.

---

## Prompt 16 — Final Quality Review

```text
نفّذ مراجعة نهائية بعد اكتمال Prompts 01–15.

راجع:
- الهوية.
- اللوجو.
- الترتيب.
- UI وUX.
- العربي والإنجليزي.
- RTL / LTR.
- Responsive.
- Accessibility.
- Performance.
- SEO.
- Projects.
- Packages.
- WhatsApp.
- Footer.

شغّل:
- npm run format:check
- npm run build
- /usr/bin/git diff --check

ابحث عن الكلمات القديمة:
- Zickrian
- Firdaus
- MotionFolio
- AI Engineer
- Machine Learning
- Indonesia
- Discord
- d4ad63
- Pacifico

أرسل حكمًا واضحًا:
- جاهز للنشر.
- أو غير جاهز مع قائمة المتبقي.

لا تنفذ Commit أو Push أو Deploy.
```

---

## Prompt 17 — Prepare for Deployment Approval

```text
جهّز النسخة للنشر بدون تنفيذ أي خطوة خارجية.

المشروع:
/tmp/zoomix-site-build-IZ1E0h/repo

المستودع:
https://github.com/zoomixegypt/Zoomix-Egypt

الدومين:
https://zoomixegypt.com

نفّذ بالترتيب:
1. راجع git status وgit diff.
2. تأكد أن .env والبيانات الحساسة غير مضافة.
3. تأكد من وجود LICENSE.
4. شغّل npm run build.
5. اعرض الملفات التي ستدخل Commit.
6. اقترح Commit message.
7. انتظر موافقة صريحة قبل Commit أو Push أو Deploy.

لا تنفذ:
- Commit.
- Push.
- Cloudflare setup.
- Domain changes.
- أي OAuth أو Login.
```

### Commit message المقترح

```text
feat: improve Zoomix UI UX and responsive experience
```

---

## Prompt 18 — Publish After Explicit Approval

```text
تمت الموافقة الصريحة على النشر.

نفّذ بالترتيب:
1. راجع الحالة الأخيرة قبل Commit.
2. نفّذ Commit بالرسالة المعتمدة.
3. نفّذ Push إلى GitHub.
4. اربط GitHub بـCloudflare Pages إذا لم يكن الربط موجودًا.
5. Build command: npm run build.
6. Output directory: build.
7. اختبر pages.dev أولًا.
8. اختبر العربي والإنجليزي.
9. اختبر كل Project Routes.
10. اختبر Project Brief وWhatsApp.
11. اربط zoomixegypt.com بعد نجاح Preview.
12. اختبر apex وwww وHTTPS.
13. جهّز Rollback واضح.

إذا ظهرت شاشة Login أو OAuth أو Permission، توقف واطلب من المستخدم تنفيذ الخطوة المطلوبة.

لا تعتبر النشر ناجحًا إلا بعد اختبار الموقع العام فعليًا.
```

---

## طريقة الاستخدام

نفّذ Prompt واحدًا في كل مرة.

بعد كل Prompt:

1. راجع التغييرات.
2. افتح المعاينة المحلية.
3. اختبر العربي والإنجليزي.
4. اختبر Desktop وMobile عند ارتباط التعديل بهما.
5. شغّل `format:check` و`build`.
6. لا تنتقل للـPrompt التالي إلا بعد اعتماد النتيجة.

Prompt 18 لا يُنفذ إلا بعد موافقة صريحة على النشر.
