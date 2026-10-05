/** Pure domain rules. Demo filtering is NOT a security boundary. */
export const MONTHLY_PRICE = 196;
export const STORAGE_KEY = 'liqa-office-console-v1';
export const MARKETERS = [{ id: 'm1', name: 'عبدالله · حساب تجريبي' }, { id: 'm2', name: 'سارة · حساب تجريبي' }];
export const STAGES = [
  ['registered', 'تم التسجيل'], ['interviewed', 'أكمل المقابلة'], ['interested', 'وافق على التجربة'],
  ['prototype', 'جرّب النموذج'], ['trial', 'حساب تجريبي'], ['paid', 'مشترك مدفوع']
];
export const uid = () => globalThis.crypto.randomUUID();
export const localDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const normalizePhone = (s = '') => s.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s()-]/g, '').replace(/^00966/, '+966').replace(/^05/, '+9665');
export const stageOf = o => o.paidAt ? 'paid' : o.trialAt ? 'trial' : o.prototypeAt ? 'prototype' : o.interestedAt ? 'interested' : o.interviewedAt ? 'interviewed' : 'registered';
export function visibleOffices(db, role, marketerId = 'm1') { return role === 'admin' ? db.offices : db.offices.filter(o => o.assignee === marketerId); }
export function validateOffice(input, offices = [], currentId = '') {
  if (!input.name?.trim() || !input.city?.trim() || !input.contact?.trim()) throw new Error('اسم المكتب والمدينة والمسؤول حقول مطلوبة.');
  if (input.phone && !/^\+9665\d{8}$/.test(normalizePhone(input.phone))) throw new Error('استخدم رقم جوال سعودي صحيحًا، أو اترك الرقم فارغًا في العرض.');
  if (input.phone && offices.some(o => o.id !== currentId && o.phone && normalizePhone(o.phone) === normalizePhone(input.phone))) throw new Error('رقم التواصل مسجل مسبقًا؛ افتح الملف الموجود بدل تكراره.');
  if (offices.some(o => o.id !== currentId && o.name.trim() === input.name.trim() && o.city.trim() === input.city.trim())) throw new Error('يوجد مكتب بهذا الاسم في المدينة نفسها.');
  return { ...input, name: input.name.trim(), city: input.city.trim(), contact: input.contact.trim(), phone: normalizePhone(input.phone) };
}
export function validatePrices(prices) {
  if (prices.every(p => p === '' || p === null || p === undefined)) return null;
  if (prices.length !== 4 || prices.some(p => p === '' || p === null || p === undefined || !Number.isFinite(Number(p)) || Number(p) < 0)) throw new Error('أدخل الأسعار الأربعة بأرقام صالحة، أو اتركها جميعًا فارغة.');
  const values = prices.map(Number);
  if (values.some((p, i) => i > 0 && p < values[i - 1])) throw new Error('تحقق من ترتيب الأسعار مع المشارك؛ لا نعدّل إجاباته تلقائيًا.');
  return values;
}
export function canManage(role, office, marketerId = 'm1') { return role === 'admin' || office.assignee === marketerId; }
export function transition(office, action, role, date = localDate()) {
  const o = structuredClone(office);
  if (!canManage(role, o)) throw new Error('هذا المكتب غير مسند لهذا المسوق.');
  if (action === 'interest') {
    if (!o.consentAt) throw new Error('يلزم توثيق موافقة التواصل أولًا من تعديل الملف.');
    o.interestedAt ||= date;
  } else if (action === 'prototype') {
    if (!o.interestedAt) throw new Error('سجل الموافقة على التجربة أولًا.');
    o.prototypeAt ||= date;
  } else if (action === 'trial') {
    if (role !== 'admin') throw new Error('تفعيل التجربة من صلاحيات الإدارة.');
    if (!o.consentAt || !o.interestedAt) throw new Error('يلزم قبول المشاركة وموافقة التواصل.');
    o.trialAt ||= date;
  } else if (action === 'paid') {
    throw new Error('تسجيل التحصيل الفعلي غير متاح في هذه النسخة؛ نعرض نموذج الاشتراك فقط.');
  } else throw new Error('إجراء غير معروف.');
  o.updatedAt = date;
  return o;
}
export function indicators(offices, tasks) {
  const ids = new Set(offices.map(o => o.id));
  return { total: offices.length, interviewed: offices.filter(o => o.interviewedAt).length,
    interested: offices.filter(o => o.interestedAt).length, trial: offices.filter(o => o.trialAt).length,
    paid: offices.filter(o => o.paidAt).length, mrr: offices.filter(o => o.paidAt).length * MONTHLY_PRICE,
    pending: tasks.filter(t => ids.has(t.officeId) && !t.done).length };
}
export function csv(rows) {
  return '\uFEFF' + rows.map(row => row.map(cell => {
    let value = String(cell ?? '');
    if (/^[\s]*[=+@-]/.test(value)) value = "'" + value;
    return '"' + value.replaceAll('"', '""') + '"';
  }).join(',')).join('\r\n');
}
export function isValidState(s) {
  return s?.version === 1 && ['offices', 'tasks', 'interviews', 'logs'].every(k => Array.isArray(s[k]))
    && s.offices.every(o => typeof o.id === 'string' && typeof o.name === 'string' && typeof o.city === 'string' && typeof o.contact === 'string' && Array.isArray(o.notes));
}
export function seed() {
  const names = ['دار الشمال', 'ركن الرياض', 'أفق العقار', 'معيار', 'بوابة المستقبل', 'مسارات العقارية', 'وجهة', 'روافد'];
  const cities = ['الرياض', 'الرياض', 'جدة', 'الدمام', 'الرياض', 'جدة', 'الخبر', 'الرياض'];
  const districts = ['الصحافة', 'الملقا', 'الروضة', 'الشاطئ', 'النرجس', 'الزهراء', 'العليا', 'حطين'];
  const offices = names.map((name, i) => ({ id: `o${i+1}`, name: `${name} · نموذج`, city: cities[i], district: districts[i], contact: `مسؤول المكتب ${i+1}`, phone: '', assignee: i < 5 ? 'm1' : 'm2', source: 'زيارة ميدانية', interest: ['عالي', 'متوسط', 'عالي'][i%3], createdAt: '2026-10-01', updatedAt: '2026-10-04', consentAt: i < 6 ? '2026-10-02' : null, interviewedAt: i < 6 ? '2026-10-02' : null, interestedAt: i < 4 ? '2026-10-03' : null, prototypeAt: i < 3 ? '2026-10-03' : null, trialAt: i < 2 ? '2026-10-04' : null, paidAt: i === 0 ? '2026-10-04' : null, notes: [{id:`n${i}`, text: i%2 ? 'يحتاج تجربة بواجهة كبيرة وخط واضح.' : 'مهتم بتنظيم رسائل واتساب ومتابعة الطلبات.', at:'2026-10-04', author:'فريق لِقا · مثال'}] }));
  return { version: 1, offices, tasks: offices.slice(0,5).map((o,i)=>({id:`t${i}`,officeId:o.id,title:['ترتيب جلسة تجربة النموذج','مكالمة متابعة','شرح خيارات الإدخال الصوتي','توثيق ملاحظات المقابلة','تحديد مسؤول الحساب'][i],due:'2026-10-08',done:false})), interviews: [], logs: [{id:'l1',action:'تهيئة بيانات توضيحية فقط؛ ليست نتائج مسح أو إيرادات فعلية.',at:'2026-10-04',officeId:null,actor:'النظام'}] };
}
