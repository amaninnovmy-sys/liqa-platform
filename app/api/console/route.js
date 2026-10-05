import {NextResponse} from 'next/server';
import {currentStaff} from '../../../lib/server/session';
import {consoleState} from '../../../lib/server/console';
import {validateCommand} from '../../../lib/access.mjs';
import {readJson} from '../../../lib/request-body.mjs';
export const dynamic='force-dynamic';
const json=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
async function session(){try{return await currentStaff()}catch{return {status:'unavailable'}}}
function denied(s){return s.status==='ok'?null:json({error:s.status==='anonymous'?'يلزم تسجيل الدخول.':s.status==='forbidden'?'الحساب غير مخوّل.':'خدمة البيانات لم تُفعّل أو غير متاحة.'},s.status==='anonymous'?401:s.status==='forbidden'?403:503)}
export async function GET(){const s=await session();const error=denied(s);if(error)return error;try{return json(await consoleState(s.client,s.staff))}catch{return json({error:'تعذر تحميل البيانات كاملة. حاول لاحقًا أو راجع الإدارة.'},503)}}
export async function POST(request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return json({error:'مصدر الطلب غير مسموح.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'صيغة الطلب غير صالحة.'},415);
 const s=await session();const error=denied(s);if(error)return error;
 let command;
 try{command=validateCommand(await readJson(request),s.staff)}catch(e){return json({error:e.message||'طلب غير صالح.'},e.status===413?413:400)}
 const result=await s.client.rpc('liqa_command',{p_action:command.action,p_office_id:command.officeId,p_data:command.data});
 if(result.error){const code=result.error.code,message=result.error.message||'';return json({error:code==='23505'?'يوجد سجل مطابق. راجع المكتب المسجل بدل تكراره.':message.includes('version_conflict')?'تغير الملف بواسطة مستخدم آخر. حدّث البيانات قبل إعادة الحفظ.':message.includes('consent')?'يلزم توثيق الموافقة المناسبة قبل هذا الإجراء.':code==='42501'?'ليست لديك صلاحية لهذا الإجراء.':'تعذر الحفظ. راجع البيانات وصلاحيات المكتب.'},message.includes('version_conflict')?409:code==='42501'?403:400)}
 // A committed transaction is acknowledged independently of dashboard refresh.
 return json({ok:true,id:result.data});
}
