# ZOOMIX Analytics Taxonomy

هذا الملف يجهز خطة القياس فقط. لا يوجد SDK أو Tracking فعلي في الموقع، ولا يتم إرسال أي بيانات إلى خدمة خارجية بدون موافقة صريحة لاحقًا.

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

## Privacy rules

- لا يتم إرسال الاسم أو رقم الهاتف أو وصف المشروع أو الميزانية أو أي نص يكتبه المستخدم.
- لا يتم تسجيل رابط WhatsApp كاملًا إذا كان يحتوي على بيانات نموذج.
- لا يتم إضافة Analytics SDK أو cookies قبل اعتماد مزود الخدمة وسياسة الخصوصية.
- عند الموافقة مستقبلًا، يجب احترام `Do Not Track` ورفض القياس افتراضيًا إذا تطلب القانون أو المنتج ذلك.
