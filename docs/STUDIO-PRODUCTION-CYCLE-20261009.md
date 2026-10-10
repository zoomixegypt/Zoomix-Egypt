# Production operational cycle — QA06

Date: 2026-10-09, Africa/Cairo. Status: core operational cycle completed after explicit acceptance confirmation; professionalism defects remain. The initial checkpoint below is preserved and superseded by the completion section.

## Production changes made

- Submitted the previously prepared, clearly fictional QA06 learning-center monthly brief through the public browser form. Reserved test phone +12025550106, example.com project link. No contact to that phone.
- Brief reference: ZMX-2026-EDF9BF; request ID 10.
- Created quote QT-2026-9FE7AB, version 1, then version 2 and issued both public links. Tokens deliberately not copied into this report.
- Selected 14% solely as a calculation test, not advice on applicable tax treatment.
- Monthly base 13,000, internal test cost 7,800; optional custom video initially 1,200, cost 500, then revised price 1,000; 60% deposit, 15 revisions, duration explicitly says no real contract.
- Sent a public revision request stating this is QA only and asking for optional video price 1,000. No acceptance, collection, catalog publication, or real customer changes.
- Test records affect live counts and must be excluded from real business reporting. No automatic destructive cleanup.

## Verified results

1. Public form saved a reference and edit link; phone-call preference did not require WhatsApp.
2. Studio refresh/search located 1 matching record among 10 total requests.
3. Quote creation ultimately transferred QA06 names, reference, 13,000 price and full monthly deliverables. A transient prior QA05 editor rendered before settling; no wrong-customer server save was performed.
4. Saving with unknown cost/missing duration was blocked with an actionable warning.
5. Invalid promotion returned 'الكود غير صالح'; clearing its input left that old feedback visible (minor UX issue).
6. Version 1: 14,200 subtotal + 1,988 tax = 16,188. Public optional deselection: 13,000 + 1,820 = 14,820. Internal cost/margin not present in visible client page text.
7. At 390px, client page document width was 390px, without horizontal overflow.
8. Public revision submission showed success; Studio notification reflected revision_requested and opened the correct quote.
9. Modified optional price saved version 2. Public page showed version 2 and 14,000 + 1,960 = 15,960.
10. Version 1 link then showed unavailable, correctly invalidated after a new version/link.

## Observed defects / professionalism gaps

- High: monthly QA06 brief retained irrelevant event fields from the preceding QA05 selection: conference, November 5, venue and parallel coverage. Conditional field clearing on selection changes is not reliable; stale data reached production storage/display.
- Medium: quote editor status chip continued to say draft after send and after a revision notification. Displayed editor state is not reliably synchronized to actual server lifecycle.
- Medium: revision notification identifies the event but the client's requested change text was not visible in the opened quote editor snapshot. Admin cannot complete the revision journey from that screen alone.
- Minor: invalid-code feedback persisted after clearing input.
- Existing audit gaps remain: PDF, rejection, detailed terms/expiry/payment amounts, real WhatsApp/email hand-off, full catalog migration, Lead Won transition.

## Not yet verified

- User confirmation of Telegram brief/send/view/revision notifications. Browser submission success is not proof of Telegram delivery.
- Acceptance and resulting project/payment creation on production; requires explicit action-time confirmation even though the quote is clearly fictional.
- Expected version-2 result if both items selected: contract 15,960; deposit 9,576; balance 6,384; net-of-tax expected profit 5,700. These are expectations, not verified database outcomes.
- Paid status/collection, reports reconciliation, audit trail and repeated acceptance handling after the acceptance gate.
- Real daily overdue reminder delivery and complete desktop/multi-breakpoint verification.

Screenshots saved in the parent workspace: studio-cycle-qa06-stale-fields.jpg, studio-cycle-client-mobile.jpg, studio-cycle-before-acceptance.jpg.

## Completion after user confirmation

The user explicitly confirmed the acceptance action and confirmed receipt of the earlier Telegram notifications. Accepted version 2 with both items selected in the public browser.

Verified on production:

- Client showed successful acceptance; Studio notification showed accepted.
- Exactly one project PRJ-2026-26433BE8, with contract 15,960, expected profit 5,700 and rounded margin 41%.
- Exactly two payments: deposit 9,576 and balance 6,384.
- Marked only the QA deposit paid as a record-update test, not a financial transfer. UI and reports showed 9,576 collected / 6,384 outstanding.
- Reports matched in Arabic and English. Direct full-page navigation resets UI language to Arabic, so English persistence across reloads is not established.
- Reversed the test collection using the UI's cancel-registration action. Final reports show collected 0, contract 15,960 and expected profit 5,700. No real money moved.
- Audit displayed quote creation, sends, revision, version creation, acceptance and both payment status changes.
- Read-only remote SQL confirmed quote ID 2, accepted, version 2, project count 1, payment count 2 and no paid amounts. Query wrote zero rows.
- At desktop width 1440, Studio document width was 1440 with no overflow on the examined leads screen; desktop sidebar/report/payment views were reviewed. Client mobile width 390 had already passed. This is not every breakpoint or every possible editor/dialog combination.
- Browser error logs were empty on Studio; the old invalid-link error was expected, and current client error logs were empty.

Additional defects confirmed:

- Linked lead still displays New after accepted quote/project creation.
- Reloading an accepted public quote restores optional selections and acceptance/revision inputs rather than displaying persistent accepted/read-only state. Server source rejects repeated acceptance, but the UI offers misleading actions after reload. No second legally binding acceptance was clicked.
- Deposit due time equals acceptance time and becomes overdue immediately. Payment-update response shows pending, while a refresh computes overdue; transient inconsistent status until refresh was observed.
- QA records are included in conversion/revenue/profit reports (100% conversion in this tiny dataset); there is no verified test-record exclusion. Final collection is zero but the accepted QA deal still contributes 15,960 contract value and 5,700 projected profit.

The successful core cycle does not certify the entire approved vision or professional readiness. Daily scheduled reminder delivery, all promotion/publication cases, PDF and other missing audit features remain outside completed verification. The user confirmed Telegram messages before acceptance; receipt of the later acceptance alert has not been separately confirmed.

Final records retained transparently: one clearly labeled QA06 brief, one accepted QA quote with two versions, one QA project, two unpaid payment records and audit history. No real customer records or published prices were changed. Do not delete or hide these without a scoped cleanup instruction; they can trigger scheduled overdue reminders.

Completion screenshots in parent workspace: studio-cycle-project.jpg, studio-cycle-reports-paid.jpg (temporary paid test), studio-cycle-final-report.jpg (final zero collection).

---

# إعادة اختبار الإنتاج بعد التحديثات — 9 أكتوبر 2026

## الحكم

دورة الأعمال الأساسية نجحت على الإنتاج، لكن لا يمكن اعتبار التجربة مكتملة احترافيًا بسبب اختلاف المعاينة وبعض تسميات الواجهة. لم تُنفّذ إصلاحات في هذه الجولة؛ هذه جولة اختبار وتوثيق.

## النطاق والأمان

- الدومين: https://zoomixegypt.com .
- طلب جديد واضح أنه QA، رقم 11، المرجع `ZMX-2026-3A0B4A`؛ تصنيفه اختبار قبل إنشاء العرض.
- عرض 4، المرجع `QT-2026-35C0B5`، النسخة الثانية؛ المشروع 2، المرجع `PRJ-2026-1BFA2D29`.
- الدفعات 3 و4 و5، المرفق 1. كل ارتباطات الدورة QA ومستبعدة من تقرير الأعمال الحقيقي وتذكيرات الدفع.
- لا تحويل أموال، لا تنفيذ خدمة، لا التزام تعاقد حقيقي. تسجيل paid هو محاكاة تحصيل لبيانات QA فقط.
- السجلات التجريبية باقية لمراجعة المالك؛ لم تُحذف. لا تعديل أسعار منشورة أو خصومات قائمة أو أسرار أو قاعدة بيانات للعملاء.
- سكربت الحماية القديم يحدث ملاحظات طلب QA رقم 10 ثم يعيدها، ويتحقق من هوية السجل قبل ذلك. لم يشغّل إرسال التذكيرات اليدوي.
- الإشعارات الناتجة عن الطلب/العرض/رد العميل قد تصل لصاحب الشركة؛ هذه الجولة لا تتضمن تأكيدًا بشريًا على وصولها.

## الاختبارات المنفذة فعلًا

`scripts/test-production-lifecycle.mjs`: **81 فحص ناجح**. يحتاج متغير موافقة صريح وكلمة مرور من البيئة، ولا يطبع كلمات المرور أو روابط العميل السرية.

1. دخول إنتاجي، وقراءة الأقسام وحماية قراءتها من غير جلسة.
2. طلب كامل ببيانات وهمية ورقم هاتف مثال، تصنيف QA، مسؤول وموعد متابعة.
3. رفض خطة دفعات لا تساوي 100% ورفض برومو غير موجود.
4. إنشاء عرض مرتبط بالطلب ووراثة علامة QA وإرساله وقراءة رابط العميل.
5. منع تسريب الملاحظات الداخلية في استجابة العميل.
6. منع قبول بدون الموافقة المطلوبة، ومنع طلب تعديل فارغ.
7. طلب تعديل، نسخة ثانية بمدة 16 يومًا، منع حفظ محرر يعمل على نسخة قديمة.
8. قبول QA، منع القبول المكرر، مشروع واحد فقط وثلاث دفعات دقيقة.
9. الإجمالي `1,140.01`، الدفعات `570.01 + 285 + 285`، بتطابق على مستوى القرش.
10. تخطيط، مهمة ومسؤول، فريق تجريبي، مصروف وهمي `333.33`، رابط تسليم HTTPS، رفض javascript link.
11. مرفق PNG خاص، رفض تنزيله بدون جلسة، وتنزيل إجباري كملف عند وجود الجلسة.
12. فاتورة تشغيلية ومسودة عقد دون الملاحظات الداخلية؛ رفض إيصال لدفعة غير مسددة.
13. بيانات تحصيل وهمية، ثلاث دفعات paid وثلاثة إيصالات QA؛ خمسة مستندات إجمالًا.
14. إتمام المهمة، انتقال إنتاج ثم مراجعة ثم تسليم ثم إغلاق، والتحقق من حفظ النتائج.
15. استبعاد مشروع QA من تقرير الربحية الحقيقي؛ إنهاء جلسة السكربت والتحقق من إبطالها.

`scripts/test-studio-production-api.mjs`: **68/68 ناجح** إضافية، تشمل حماية الكتابة، منع cross-origin، خصوصية أسعار التكلفة العامة، نسخة أعمال تغطي 18 جدولًا دون جلسات، والتحقق من بيانات QA السابقة دون تغيير حالتها المالية.

المجموع 149 فحص API ناجح، وليس 149 سيناريو مستقلًا؛ بعض قراءات المسارات تتكرر.

## المتصفح — إنتاج، وليس localhost

- تصفح أقسام التحكم والمشروعات والمدفوعات والتقارير والعروض وقائمة الأسعار والإعدادات والطلبات ومحرر عروض الأسعار.
- فتح مساحة مشروع الدورة: مرحلة مغلق، المهمة مكتملة، المصروف والمرفق والمستندات ظاهرة.
- فتح الفاتورة: علامة TEST QA، النطاق والشروط والضريبة وخطة الدفعات ظاهرة، وتنبيه أنها ليست فاتورة ضريبية معتمدة.
- إلغاء تسجيل paid للدفعة QA رقم 3 ثم إعادة تسجيلها paid من الواجهة؛ حفظ الحالة ظاهر بعد كل خطوة. لم يُنقل أي مال.
- محرر العرض المقبول مقفل ضد تعديل النطاق والإرسال، ويطلب عرضًا جديدًا للتغيير. النسخة 2 والمدة 16 يومًا ظاهرتان.
- معاينة كعميل داخل الاستوديو تعمل، لكنها لا تطابق جميع الشروط المحفوظة كما في الملاحظات أدناه.
- عرض الموبايل 360×800: scrollWidth=clientWidth=360، والقائمة الجانبية اختفت بعد استقرار الانتقال؛ أعيد إعداد العرض الافتراضي بعد الفحص.
- سجل أخطاء صفحة الاستوديو في هذه الجولة: فارغ.

## المشكلات المؤكدة، بالترتيب

| الأولوية | المشكلة | الدليل | المطلوب |
| --- | --- | --- | --- |
| P1 | المعاينة الداخلية غير مطابقة للعرض | المحرر المحفوظ: صلاحية 7 أيام وثلاث دفعات. المعاينة: 14 يومًا ونسبة مقدم 50% فقط | ربط المعاينة بالشروط والإصدار المحفوظ وعرض خطة الدفعات كاملة؛ اختبار تطابقها مع صفحة العميل |
| P2 | أسماء الدفعات المخصصة تضيع في جدول المدفوعات | دفعات QA deposit/review/delivery تظهر جميعًا «باقي الرصيد» | إعادة label في قائمة API واستخدامه للدفعات custom مع fallback مناسب |
| P2 | حالات ونطاقات تظهر بالإنجليزي وسط النسخة العربية | closed/paid/pending/overdue وselected/private في واجهات المشروعات والمدفوعات والعروض | ترجمة مسميات العرض مع بقاء قيم التخزين ثابتة |
| P3 | استبعاد QA من بعض الملخصات غير مفسر قرب الأرقام | الجدول يظهر دفعات QA مسددة والملخص المحصل=0؛ الاستبعاد صحيح لكن يحتاج إيضاحًا | تنبيه بجوار الملخصات أن بيانات الاختبار غير محسوبة، وفاصل/فلتر للعرض |

## حدود النتيجة

- ليست اختبار كل السيناريوهات الممكنة أو اختبار اختراق أو تحمل موزع.
- لم تُجرّب كل رحلة الخصومات الفعلية بنشر برومو أو اعتماد باقة على الإنتاج؛ تجنبنا تغيير العرض التجاري الحقيقي. هذه الجولة اختبرت الرفض والقراءة والحماية فقط لهذه الحالات.
- لم يُستخدم Safari أو Firefox فعليًا. لم يجر اختبار قطع الشبكة على الإنتاج أو الانتظار حتى انتهاء رابط عرض.
- فتح الفاتورة في المتصفح لا يثبت جودة PDF مُصدّر؛ زر الطباعة ظاهر ولم تُحفظ نسخة PDF في هذه الجولة.
- لا تأكيد جديد على وصول Telegram أو إرسال cron اليوم؛ لا تُنسب أدلة الجولات السابقة لهذه الجولة.

## الأدلة المحلية خارج Git

- `../studio-production-cycle-project.png`: مساحة المشروع والمستندات.
- `../studio-production-cycle-payments.png`: الدفعات بعد استعادة paid.
- `../studio-production-cycle-mobile.png`: عرض الموبايل.
- `../studio-production-cycle-preview.png`: دليل اختلاف المعاينة.

الخطوة التالية: إصلاح المشاكل الأربع، ثم إعادة اختبار التطابق بين المحرر والمعاينة وصفحة العميل، وأسماء الدفعات والترجمة، قبل وصف الاستوديو بأنه جاهز بالكامل.

## تنفيذ الإصلاحات وإعادة التحقق

- أصلحت النقاط الأربع بعد طلب المالك: المعاينة تستمد الصلاحية والشروط والاستبعادات والدفعات من بيانات العرض، ونافذة الإرسال تعرض الصلاحية نفسها؛ API الدفعات يعيد label في القائمة وتحديث الحالة، والواجهة تعرضه للدفعات المخصصة.
- ترجمت حالات المشروعات والمدفوعات ونطاق/وصول البرومو دون تغيير قيم التخزين. أضفت توضيح استبعاد QA بجوار ملخصات المدفوعات والمشروعات؛ وعدّاد المشروعات النشطة يستبعد المسلّمة والمغلقة.
- build وSSR والاختبارات التجارية ومصفوفة Studio نجحت. اختبار عرض إضافي `scripts/test-studio-display.mjs` يغطي التسميات وfallback وعقد المعاينة وحقول API؛ أضيف لأمر test:studio.
- النشر اكتمل: https://8952b040.zoomix-egypt.pages.dev . الملفات لم تُحفظ في commit جديد بعد هذه الجولة.
- تأكدت من النسخة الجديدة على الدومين: `/assets/index-Bmk00ARf.js`. تبويب قديم عرض النسخة السابقة ثم تعثر تحميل chunk؛ تبويب إنتاج جديد وصل للنسخة الجديدة وأظهر الإصلاحات. لا يُدّعى إصلاح عام لكل حالات cache بهذا التحقق.
- معاينة عرض QA رقم 4 أظهرت 7 أيام فعلًا، والدفعات الثلاث 50/25/25 وأيام 0/7/14، والشروط والاستبعادات.
- جدول الإنتاج أظهر QA deposit / QA review / QA delivery بدل Balance، وحالات مسددة/متأخرة/قيد التحصيل، وتنبيه استبعاد QA من الملخصات.
- الأدلة خارج Git: `../studio-fixed-preview-production.png` و`../studio-fixed-payments-production.png`.
- إعادة التحقق لم تنشئ طلبًا أو تغيّر دفعة أو أسعارًا. حدود Safari/Firefox وPDF ووصول Telegram المذكورة أعلاه لم تتغير.
