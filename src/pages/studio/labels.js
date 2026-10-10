const labels = {
  confirmed: ['مؤكد', 'Confirmed'], planning: ['تخطيط', 'Planning'], production: ['إنتاج', 'Production'],
  review: ['مراجعة', 'Review'], delivered: ['تم التسليم', 'Delivered'], closed: ['مغلق', 'Closed'],
  paid: ['مسددة', 'Paid'], pending: ['قيد التحصيل', 'Pending'], overdue: ['متأخرة', 'Overdue'], cancelled: ['ملغاة', 'Cancelled'],
  selected: ['بنود مختارة', 'Selected items'], all: ['كل البنود', 'All items'], foundation: ['التأسيس', 'Foundation'],
  partnership: ['الشراكة', 'Partnership'], content: ['المحتوى', 'Content'], events: ['الفعاليات', 'Events'],
  private: ['كود خاص', 'Private code'], public: ['عام', 'Public'],
};
export const studioLabel = (value, language) => labels[value]?.[language === 'ar' ? 0 : 1] || value || '—';
export const qaMetricsNote = language => language === 'ar' ? 'الملخصات لا تشمل بيانات اختبار QA؛ قد تظهر سجلات الاختبار في الجدول.' : 'Summary totals exclude QA test data; test records may still appear in the table.';
export const paymentLabel = (payment, language) => payment.type === 'custom' ? (payment.label || (language === 'ar' ? 'دفعة مخصصة' : 'Custom instalment')) : payment.type === 'deposit' ? (language === 'ar' ? 'المقدم' : 'Deposit') : (language === 'ar' ? 'باقي الرصيد' : 'Balance');
