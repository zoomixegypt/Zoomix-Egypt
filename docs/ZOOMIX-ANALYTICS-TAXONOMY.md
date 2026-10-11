# ZOOMIX Analytics Taxonomy

هذا الملف يصف القياس المفعّل داخل صفحات الموقع العامة. يبدأ القياس تلقائيًا دون نافذة موافقة، ويظل محدودًا بالأحداث غير الحساسة ومنفصلًا عن بيانات البريف، ويُرسل إلى Google Analytics وWorker داخلي ثم D1. تخزين الإعلانات وبيانات الإعلانات والتخصيص الإعلاني مرفوضة، ولا تُقاس صفحات الاستوديو أو روابط العملاء أو تحرير البريف. أي رفض صريح محفوظ من زيارة سابقة يظل محترمًا. لا يوجد إرسال لبيانات البريف إلى Analytics.

| Event | Trigger location | Non-sensitive properties |
| --- | --- | --- |
| `start_project` | Hero وCTA بداية المشروع | `source_section`, `language` |
| `view_work` | رابط/زر الأعمال | `source_section`, `language` |
| `open_project` | بطاقة مشروع أو فتح الـModal | `project_slug`, `language` |
| `choose_package` | زر اختيار الباقة | `package_id`, `source_section`, `language` |
| `start_brief` | دخول Project Brief أو أول تفاعل مع الحقول | `source_section`, `language` |
| `validation_error` | ظهور خطأ تحقق في النموذج | `field_name`, `language` |
| `send_to_whatsapp` | الضغط على إرسال النموذج | `service_id`, `package_id`, `language` |
| `social_link_click` | الضغط على رابط Social | `network`, `language` |
| `language_change` | زر تبديل اللغة | `from_language`, `to_language` |
| `reach_project_brief` | وصول القسم إلى viewport | `language` |
| `analytics_consent` | الموافقة على القياس | `choice` |
| `brief_submitted` | حفظ البريف بنجاح | `route`, `package_id`, `language` |
| `route_finder_start` | بدء مساعدة اختيار المسار | `route`, `language` |
| `route_finder_answer` | الإجابة على خطوة من Route Finder | `step`, `answer`, `language` |
| `route_finder_recommendation` | حفظ الترشيح أو الاختيار | `route`, `package_id`, `language` |

## Privacy rules

- لا يتم تسجيل رابط WhatsApp كاملًا إذا كان يحتوي على بيانات نموذج.
- لا يتم إرسال أي حدث من صفحات الإدارة أو روابط العملاء أو تحرير البريف.
- لا يتم إرسال الاسم أو رقم الهاتف أو وصف المشروع أو الميزانية أو أي نص يكتبه المستخدم.
- يجب إضافة إفصاح واضح عن استخدام Google Analytics في سياسة الخصوصية أو صفحة مناسبة قبل النشر العام.
- عند تشغيل الموقع في منطقة تتطلب موافقة مسبقة، يجب استبدال الوضع التلقائي بوضع موافقة إقليمي قبل النشر هناك.
