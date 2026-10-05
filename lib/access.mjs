/** Shared validation only. Authentication and authorization also run on the server and in RLS. */
import {normalizePhone, validatePrices} from './offices.mjs';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ACTIONS = new Set(['create','edit','interest','prototype','trial','note','interview','task','complete']);
export function hasAccess(staff, required) {
  return !!staff && staff.active === true && ['admin','marketer'].includes(staff.role) && (!required || staff.role === required);
}
export function safeDestination(staff) { return staff?.role === 'admin' ? '/admin/' : '/marketer/'; }
const text=(v,n,required=false)=>{if(v!=null&&typeof v!=='string')throw Error('قيمة نصية غير صالحة.');const s=(v||'').trim();if((required&&!s)||s.length>n)throw Error('راجع الحقول المطلوبة وطول النص.');return s;};
export function validateCommand(body, staff) {
  if(!hasAccess(staff))throw Error('ليس لديك صلاحية.');
  if(!body||!ACTIONS.has(body.action))throw Error('إجراء غير مدعوم.');
  const {action}=body;const officeId=body.officeId||null;
  if(action!=='create'&&!UUID.test(officeId||''))throw Error('معرف المكتب غير صالح.');
  if(action==='trial'&&staff.role!=='admin')throw Error('بدء التجربة من صلاحيات الإدارة.');
  const d=body.data||{};let data={};
  if(['create','edit'].includes(action)){
    data={name:text(d.name,100,true),city:text(d.city,40,true),district:text(d.district,60),contact:text(d.contact,80,true),phone:normalizePhone(text(d.phone,24)),source:text(d.source,40)||'زيارة ميدانية',interest:text(d.interest,20)||'متوسط',consent:d.consent===true||d.consent==='on'};
    if(data.phone&&!/^\+9665\d{8}$/.test(data.phone))throw Error('رقم الجوال السعودي غير صالح.');
    if(!['عالي','متوسط','منخفض'].includes(data.interest)||!['زيارة ميدانية','إحالة شريك','اتصال وارد'].includes(data.source))throw Error('اختر قيمة من القائمة.');
    data.assignee=staff.role==='marketer'?staff.user_id:text(d.assignee,36,true);
    if(!UUID.test(data.assignee))throw Error('اختر مسوقًا فعالًا.');
    if(action==='edit'){if(!Number.isInteger(d.version)||d.version<1)throw Error('نسخة الملف غير صالحة؛ حدّث البيانات.');data.version=d.version;}
  }else if(action==='note')data={text:text(d.text,1200,true)};
  else if(action==='interview'){
    if(!(d.researchConsent===true||d.researchConsent==='on'))throw Error('وثّق موافقة المشاركة البحثية أولًا.');
    data={researchConsent:true,workflow:text(d.workflow,80,true),pain:text(d.pain,1500),prices:validatePrices([d.p1,d.p2,d.p3,d.p4])};
  }else if(action==='task'){
    data={title:text(d.title,120,true),due:text(d.due,10,true)};
    if(!/^\d{4}-\d{2}-\d{2}$/.test(data.due)||!Number.isFinite(Date.parse(data.due+'T12:00:00Z'))||new Date(data.due+'T12:00:00Z').toISOString().slice(0,10)!==data.due)throw Error('تاريخ المتابعة غير صالح.');
  }else if(action==='complete'){
    if(!UUID.test(d.taskId||'')||typeof d.done!=='boolean')throw Error('بيانات المهمة غير صالحة.');data={taskId:d.taskId,done:d.done};
  }
  return {action,officeId,data};
}
