# مراجعة شاملة لوظائف Studio — 2026-10-09

> هذا سجل نتائج **قبل الإصلاح**. إصلاحات الكود المحلي ونتائج الاختبارات الجديدة موثقة في STUDIO-FIXES-20261009.md. لا تعتبر نتائج الإنتاج القديمة إثباتًا لنشر الإصلاحات الجديدة.

## الحكم التنفيذي

الأقسام التسعة موجودة ويمكن التنقل بينها، والدورة التجارية الأساسية تعمل، لكن النظام ليس مكتملًا احترافيًا ولا يصح إعلان نجاح جميع السيناريوهات. ظهرت عيوب فعلية في التحقق من المدخلات، اتساق البيانات، واجهة حالات العروض، وتغطية التصور الأصلي. هذا تقرير اختبار، لا تقرير إصلاح: لم أعدّل كود التطبيق أو أنشر إصدارًا جديدًا أو أعمل commit/push في هذه الجولة.

الإنتاج المختبر: https://zoomixegypt.com — الفرع main، baseline commit 65959dc818f783fcf05b74998db06adb71d83e2e. وقت الاختبار مساء 2026-10-08 UTC / بداية 2026-10-09 القاهرة.

## النتائج والأدلة

| نوع التحقق | النتيجة | حدود الدليل |
| --- | --- | --- |
| API حقيقي على الإنتاج | 48 / 48 PASS | حماية الوصول، القراءة، التصدير كاستجابة HTTP، تعديلات QA فقط، تذكير يدوي |
| اختبارات قواعد وسيناريوهات خلفية مع SQLite معزولة | 94 PASS / 6 FAIL من 100 | لا تمثل 100 طلب إنتاج؛ Telegram محاكى في هذه البيئة |
| اختبارات الانحدار الحالية npm run test:studio | نجحت | عرض AR/EN، قواعد تجارية، ذرية قبول/استهلاك كود، rollback، أقفال تذكير |
| بناء الإنتاج npm run build | نجح، exit 0 | نجاح البناء ليس دليلًا على اكتمال الوظائف |
| تحميل أقسام Studio التسعة | 27 تحققًا: AR desktop 1440 / AR mobile 360 / EN tablet 768 | العنوان الصحيح بعد اكتمال التحميل، عرض DOM لا يتجاوز viewport؛ ليست 27 دورة تعديل كاملة |
| تسجيل الدخول بالمتصفح | كلمة خاطئة مرفوضة؛ الصحيحة نجحت؛ logout ظهر | رسالة الخطأ الإنجليزية على صفحة عربية تحتاج توحيد لغة |

لا تجمع الأرقام السابقة في نسبة جاهزية واحدة: توجد تغطيات متداخلة، وفحوص API لملفات التصدير تثبت HTTP 200 فقط ولا تثبت صلاحية الاستعادة أو اكتمال المحتوى.

## مصفوفة التغطية حسب الوظيفة

| القسم / المسار | ما تم فعليًا | الحكم |
| --- | --- | --- |
| المصادقة | دخول/خروج، كلمة خاطئة، رفض قراءة وكتابة بلا جلسة، جلسة منتهية، HttpOnly/Secure/SameSite | ناجح ضمن الحالات المختبرة؛ لا تدقيق أمني شامل |
| التحكم | تحميل الأرقام والتنقل وتحديث البيانات ومطابقة بعض النتائج مع مشروع QA06 | يعمل، لكن بيانات QA تدخل الإحصاءات |
| الطلبات | البحث عن QA، عرض التفاصيل، تغيير ملاحظات ثم استعادتها API، رفض status غير صحيح، قواعد حقول واتصال وموافقة/rate limit | يعمل جزئيًا؛ حقول حدث قديمة انتقلت لطلب شهري |
| قائمة الأسعار | إنشاء خاص، تحرير، نشر داخلي، تعديل draft مع حفظ snapshot المنشور، أرشفة/استعادة/نسخ، إخفاء QA والتكلفة عن API العام | العمليات المختبرة نجحت؛ لا واجهة استرجاع إصدار تاريخي، الكتالوج الحقيقي لم يُنقل بالكامل |
| عروض الأسعار | إنشاء/حفظ/إعادة فتح، تعديل كمية/سعر/تكلفة، ترتيب بنود، optional، ضريبة ومقدم، إصدار جديد ورابط قديم غير متاح، preview | المسار الأساسي ناجح؛ مشاكل server validation وحالة الواجهة واللغة |
| عروض الخصم | نسبة 10%، مبلغ 50، إضافة مجانية وحدة واحدة، نطاق خاص، pause، رفض حفظ بعد pause، حسابات وتواريخ وحدود استخدام معزولة | ناجح ضمن التغطية؛ لم نقبل عرضًا جديدًا بكود في الإنتاج |
| صفحة العميل | عرض AR/EN، حساب اختيار/إلغاء optional، طلب تعديل، قبول QA06 سابقًا بتأكيد المستخدم، منع قبول متكرر معزول، رابط منتهي/غير صالح | أساسي ناجح؛ إعادة فتح المقبول لا تُظهر حالة نهائية مناسبة |
| المشروعات | إنشاء مشروع واحد من قبول QA06، بيانات عقد/هامش ومطابقة المبالغ | أساسي فقط؛ لا إدارة مهام/ملفات/تكلفة فعلية مكتملة |
| المدفوعات | إنشاء دفعتين، paid ثم reversal في الجولة السابقة، رفض حالة خاطئة، مطابقة تقارير، تذكير حقيقي يدوي ومنع تكراره | أساسي ناجح؛ due date الفوري يجعل المقدم متأخرًا، cron التلقائي لم يُرصد |
| التقارير | AR/EN، مطابقة عقد 15,960 ومقدم 9,576 وباقي 6,384 والتحصيل النهائي صفر | تقارير تشغيلية محدودة، ليست محاسبة أو BI مكتمل |
| الإعدادات/Telegram/السجل | حالة المفاتيح دون كشفها، أحداث إنشاء/نشر/أرشفة/إصدار، إشعارات سابقة أكد المستخدم وصولها | توجد تكاملات؛ وصول آخر تذكير يدوي يحتاج تأكيد منفصل |
| البحث/التنقل/المقاسات | بحث مرجع يفتح العرض الصحيح، لا نتائج، More mobile، محرر كتالوج داخل 360، الأقسام التسعة 3 configurations | ناجح ضمن المقاسات؛ لا شهادة لكل جهاز أو متصفح |
| CSV/JSON backup | حماية الوصول واستجابة 200، فحص csvCell معزول، قراءة تنفيذ backup | CSV يحتاج حماية صيغة؛ backup ليس نسخة كاملة للبيانات التجارية |

## العيوب المؤكدة الجديدة

| الأولوية | المشكلة | إعادة الإنتاج / الدليل | أثرها وما يجب إصلاحه |
| --- | --- | --- | --- |
| P1 | إنشاء عرض بعد فشل إضافة بنوده يترك سجلًا يتيمًا | unknown catalog ID → FOREIGN KEY exception، زيادة عدد quotes بمقدار 1 رغم الفشل، SQLite isolated | حفظ إنشاء العرض وبنوده كوحدة ذرية، والتحقق من catalog IDs قبل الكتابة |
| P1 | قيمة JSON null تتسبب باستثناء بدل 400 | quote create body null → Cannot read properties of null | تطبيع/تحقق نوع body قبل أي وصول للحقول، رسالة خطأ آمنة |
| P1 | CSV لا يحيّد بداية صيغة spreadsheet | csvCell('=1+1') لا تضيف حماية، اختبار دالة معزول | احتمال formula injection عند فتح تصدير ببيانات غير موثوقة؛ لم يتم تشغيل صيغة خبيثة أو إثبات استغلال |
| P2 | API يقبل عرضًا بلا مدة تنفيذ | المتوقع 400، الفعلي 201؛ UI تمنعه لكن الخادم لا | توحيد validation في الخادم والواجهة |
| P2 | طلب تعديل بلا نص ينجح | public revision message empty → 200 | رفض الطلب الفارغ وإظهار النص للمسؤول |
| P2 | تبديل اللغة ثم إرسال دون حفظ لا يحدّث لغة العرض | تبديل AR→EN ثم send: صفحة العميل بقيت AR، explicit save جديد أصلح لغة النسخة | اعتبار تغيير اللغة تعديلًا يحتاج حفظ أو فصل لغة الوثيقة بوضوح |
| P2 | حالة محرر العرض دائمًا مسودة حتى مع sent/viewed | عرض QA3 المخزن sent V3، الواجهة مسودة | عرض الحالة الفعلية وربطها بإجراءات مسموحة |
| P3 | archived يظهر كداخلي في جدول الكتالوج | D1 archived وداخل المحرر استعادة كمسودة؛ الجدول داخلي | شارة أرشيف واضحة وفلاتر حالة |
| P3 | إزالة الخصم تعرض الكود غير صالح رغم أنه أُزيل | تفريغ input ثم Apply، الخصم يصبح صفر مع رسالة invalid | زر إزالة مستقل ومسح feedback عند الإزالة |
| P3 | تسجيل الدخول يعرض خطأ إنجليزي في AR | wrong password بالمتصفح | توحيد الترجمة |

## عيوب الدورة السابقة التي ما زالت قائمة

- P1 اتساق بيانات الطلب: QA06 الشهري يحمل conference/date/location من QA05 السابق. تنظيف الحقول غير ذات الصلة في الواجهة والخادم.
- P2 الطلب يظل New بعد قبول العرض؛ لا انتقال Won متسق.
- P2 صفحة العميل بعد قبول العرض وإعادة التحميل تعرض خيارات قبول/تعديل بدل حالة نهائية. الخادم يمنع قبولًا ثانيًا في الاختبار المعزول؛ خلل تجربة وليس دليل إنشاء مشروع مكرر.
- P2 المقدم يصير overdue فور القبول بسبب تاريخ استحقاق لحظي، وتحديث paid→pending يعيد pending ثم refresh يحسب overdue.
- P2 لا يظهر نص طلب التعديل بوضوح للمسؤول في محرر العرض.
- P2 بيانات QA تتداخل مع الإيرادات/الهامش والتذكيرات، فلا تعتبر الأرقام الحالية أرقام شركة حقيقية.

تفاصيل وأدلة الدورة في STUDIO-PRODUCTION-CYCLE-20261009.md، ومقارنة التصور في STUDIO-PLAN-AUDIT-20261009.md.

## وظائف في التصور لكنها غير مكتملة

- PDF عربي/إنجليزي، رفض العرض مع السبب، 3 بدائل مقارنة، شروط/استبعادات/انتهاء واضح ومبالغ دفعات في صفحة العميل.
- ترحيل كامل الباقات الحقيقية إلى الكتالوج وقواعد حد أدنى سعر/موافقة على الاستثناءات.
- استرجاع نسخة تاريخية للكتالوج عبر الواجهة؛ وجود snapshots وحده ليس هذه الوظيفة.
- خطط دفع مرنة، فواتير/إيصالات/عقود، بدل خطة ثابتة دفعتين وتاريخ 30 يومًا.
- Pipeline ومسؤول ومتابعة/تقييم lead، مهام وملفات وتكلفة فعلية للمشروع.
- تقارير مصادر/ROI وربحية فعلية؛ التقارير الحالية محدودة وليست محاسبة كاملة.
- إرسال WhatsApp/email فعلي: رابط العرض وحده لا يثبت وصول رسالة للعميل.
- Backup تجاري شامل واستعادة مثبتة: التنفيذ القديم لا يغطي جميع quote/catalog/project/payment tables.
- وظائف بعض endpoints القديمة لا توجد في واجهة Studio الجديدة.

## بيانات الاختبار والحالة النهائية

لم تُعدّل أسعار باقات عامة أو سجلات عملاء حقيقيين. لم تتم أي عملية تحويل أموال. الاختبارات العميقة الخاطئة أُجريت على SQLite معزولة.

تحقق D1 مباشر بعد الانتهاء:

| السجل | الحالة النهائية |
| --- | --- |
| qa-audit-20261009 | archived، داخلي غير متاح للعميل |
| qa-audit-20261009-copy-062125 | archived |
| QA-AUDIT-P10 / FIX / FREE | paused، usage_count=0 لكل منها |
| QT-2026-71453D، quote ID3 | draft V4، public_token_hash NULL؛ الرابط السابق ظهر غير متاح في المتصفح |
| طلب QA06، ID10 | الملاحظات الأصلية استُعيدت بعد اختبار API |
| QT-2026-9FE7AB، quote ID2 / project1 | QA مقبول باقٍ من الدورة السابقة، دفعتان غير paid، التحصيل صفر |
| آخر تذكير يدوي QA | أُرسل مرة من الخادم، الإعادة suppressed؛ لم نتحقق من cron الفعلي |

احتفظنا بالسجلات التجريبية المؤرشفة والمسودات كأثر QA ولم نحذفها نهائيًا. المشروع المقبول القديم ما زال يدخل التقارير وقد ينتج تذكيرات لاحقة؛ يحتاج تنظيفًا محدود النطاق بموافقة مستقلة. جلسة API المؤقتة أُغلقت، وviewport المؤقت أُعيد للوضع الطبيعي. لا tokens أو كلمات سر في التقرير.

دليل مرئي: ../studio-audit-final-draft.jpg، ../studio-audit-mobile-settings.jpg، ../studio-audit-mobile-catalog-editor.jpg.

## ما لم يُثبت بهذه الجولة

1. تنفيذ cron في موعده ووصول أحدث تذكير على جهاز Telegram، لا مجرد dispatch ناجح.
2. قبول عرض جديد بكود خصم على الإنتاج وحدوده تحت التزامن؛ يغطيه اختبار معزول لكن لا قبول إضافي دون تأكيد المستخدم.
3. Load/stress/real distributed concurrency، انقطاع شبكة أثناء submit، recovery بعد تعطل كامل، استعادة backup إنتاج.
4. كل متصفحات Safari/Firefox والأجهزة الفعلية، screen reader وkeyboard accessibility audit كامل.
5. كل permutations الممكنة لحقول النماذج؛ لا يوجد اختبار محدود يضمن جميع الاحتمالات.
6. إرسال بريد/WhatsApp حقيقي وتأكيد الاستلام؛ محاكاة أو فتح الرابط لا يعادل delivery.
7. جوانب أمنية كاملة مثل CSRF/penetration/rate limits لكل endpoint؛ اختبار auth هنا أضيق من تدقيق أمني.

## ترتيب الإصلاح وإعادة الاختبار

1. ذرية إنشاء العرض + validation للـbody/IDs/المدة/طلب التعديل + CSV safety.
2. تنظيف الحقول الشرطية + اتساق حالات lead/quote/client/payment ولغة الوثيقة.
3. إظهار طلب التعديل، شارات الحالات، إزالة الخصم، اكتمال نسخة احتياطية قابلة للاستعادة.
4. استكمال وظائف التصور المفقودة بقرار نطاق، ثم اختبار دورة من الصفر عليها.
5. عزل QA عن التقارير والتذكيرات، ثم regression مع إنتاج محدود وآمن، وcron/أجهزة/شبكة وتزامن في بيئة مناسبة.

بوابة نجاح المرحلة الحالية: فحوص المعزول كلها خضراء بعد الإصلاح، عدم وجود سجلات جزئية بعد فشل الحفظ، عدم تسرب حقول قديمة، حالة قبول نهائية صحيحة، تقارير لا تحتوي QA، وإثبات استعادة بيانات تجارية. لا نشر لإصلاحات في هذه الجولة.

## إعادة تشغيل الاختبارات

```powershell
npm run test:studio
node scripts/test-studio-matrix.mjs
npm run build
```

اختبار API الإنتاج في scripts/test-studio-production-api.mjs يتطلب QA_STUDIO_PASSWORD من بيئة مؤقتة خاصة. يعدّل ملاحظات QA10 ثم يستعيدها؛ لا تشغله على بيانات أخرى. QA_SEND_REMINDER=1 يرسل تنبيهًا حقيقيًا ولا يستخدم إلا بعد مراجعة بوابة أن جميع المستحقات تخص QA06. لا تحفظ كلمات السر في Git.

## نتائج الـ100 حالة المعزولة بالتفصيل

هذه حالات إعادة إنتاج قبل أي إصلاح؛ FAIL مقصود لتوثيق السلوك الفعلي وليس ادعاء نجاح.

| الحالة | المتوقع | الفعلي | النتيجة |
| --- | --- | --- | --- |
| auth:studioRequests | 401 | 401 | PASS |
| auth:studioCatalog | 401 | 401 | PASS |
| auth:studioQuotes | 401 | 401 | PASS |
| auth:studioProjects | 401 | 401 | PASS |
| auth:studioPayments | 401 | 401 | PASS |
| auth:studioPromotions | 401 | 401 | PASS |
| auth:studioIntegrations | 401 | 401 | PASS |
| auth:studioAudit | 401 | 401 | PASS |
| auth:studioInsights | 401 | 401 | PASS |
| auth:studioExport | 401 | 401 | PASS |
| auth:studioBackup | 401 | 401 | PASS |
| quote rejects:empty items | 400 | 400 | PASS |
| quote rejects:101 items | 400 | 400 | PASS |
| quote rejects:zero quantity | 400 | 400 | PASS |
| quote rejects:negative quantity | 400 | 400 | PASS |
| quote rejects:negative price | 400 | 400 | PASS |
| quote rejects:negative cost | 400 | 400 | PASS |
| quote rejects:unknown cost | 400 | 400 | PASS |
| quote rejects:missing English name | 400 | 400 | PASS |
| quote rejects:negative tax | 400 | 400 | PASS |
| quote rejects:tax over 100 | 400 | 400 | PASS |
| quote rejects:negative deposit | 400 | 400 | PASS |
| quote rejects:deposit over 100 | 400 | 400 | PASS |
| quote rejects:fractional revisions | 400 | 400 | PASS |
| quote rejects:revisions over 100 | 400 | 400 | PASS |
| quote rejects:missing client name | 400 | 400 | PASS |
| quote rejects:missing project name | 400 | 400 | PASS |
| quote rejects:missing duration | 400 | 201 | FAIL |
| quote rejects:null item | 400 | 400 | PASS |
| quote rejects:unknown catalog ID | 400 | FOREIGN KEY constraint failed | FAIL |
| quote valid create | 201 | 201 | PASS |
| promo rejects:percentage >80 | 400 | 400 | PASS |
| promo rejects:zero discount | 400 | 400 | PASS |
| promo rejects:negative value | 400 | 400 | PASS |
| promo rejects:invalid kind | 400 | 400 | PASS |
| promo rejects:bad code | 400 | 400 | PASS |
| promo rejects:no eligible items | 400 | 400 | PASS |
| promo rejects:nonexistent eligible item | 400 | 400 | PASS |
| promo rejects:free item omitted | 400 | 400 | PASS |
| promo rejects:free service instead of addon | 400 | 400 | PASS |
| promo rejects:invalid date | 400 | 400 | PASS |
| promo rejects:end before start | 400 | 400 | PASS |
| promo rejects:fractional usage limit | 400 | 400 | PASS |
| promo rejects:zero usage limit | 400 | 400 | PASS |
| promo rejects:invalid scope | 400 | 400 | PASS |
| promo create | 201 | 201 | PASS |
| promo duplicate code | 409 | 409 | PASS |
| catalog negative price | 400 | 400 | PASS |
| catalog nonexistent update | 404 | 404 | PASS |
| quote nonexistent detail | 404 | 404 | PASS |
| quote nonexistent send | 404 | 404 | PASS |
| payment nonexistent update | 404 | 404 | PASS |
| payment invalid status | 400 | 400 | PASS |
| promo nonexistent update | 404 | 404 | PASS |
| public invalid token | 404 | 404 | PASS |
| stale base version | 409 | 409 | PASS |
| public accept without consent | 400 | 400 | PASS |
| public empty revision | 400 | 200 | FAIL |
| public unknown action | 400 | 400 | PASS |
| public accept | 200 | 200 | PASS |
| public duplicate accept | 409 | 409 | PASS |
| accepted quote immutable | 409 | 409 | PASS |
| accepted quote cannot resend | 409 | 409 | PASS |
| accepted project count | 1 | 1 | PASS |
| accepted payment count | 2 | 2 | PASS |
| public expired token | 404 | 404 | PASS |
| promo rule:paused | true | true | PASS |
| promo rule:expired | true | true | PASS |
| promo rule:future | true | true | PASS |
| promo rule:exhausted | true | true | PASS |
| fixed discount capped at total | 0 | 0 | PASS |
| brief rejects:name required | true | true | PASS |
| brief rejects:service required | true | true | PASS |
| brief rejects:description required | true | true | PASS |
| brief rejects:phone required | true | true | PASS |
| brief rejects:consent required | true | true | PASS |
| brief rejects:invalid contact | true | true | PASS |
| brief rejects:invalid email | true | true | PASS |
| brief rejects:honeypot | true | true | PASS |
| brief rejects:show subtype required | true | true | PASS |
| brief rejects:event date required | true | true | PASS |
| brief accepts:call |  |  | PASS |
| brief accepts:WhatsApp |  |  | PASS |
| brief accepts:email |  |  | PASS |
| failed quote create has no orphan record | 0 | 1 | FAIL |
| invalid body:null | 400 | Cannot read properties of null (reading 'clientName') | FAIL |
| invalid body:array | 400 | 400 | PASS |
| brief rate limit accepts 1 | true | true | PASS |
| brief rate limit accepts 2 | true | true | PASS |
| brief rate limit accepts 3 | true | true | PASS |
| brief rate limit accepts 4 | true | true | PASS |
| brief rate limit accepts 5 | true | true | PASS |
| brief rate limit rejects sixth | false | false | PASS |
| brief rate limit resets after expiry | true | true | PASS |
| invalid brief edit token | 404 | 404 | PASS |
| CSV formula text neutralized | true | false | FAIL |
| session cookie:HttpOnly | true | true | PASS |
| session cookie:Secure | true | true | PASS |
| session cookie:SameSite=Lax | true | true | PASS |
| expired session denied | 401 | 401 | PASS |
