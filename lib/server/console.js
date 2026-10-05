import 'server-only';
const day=v=>v?v.slice(0,10):null;
export async function consoleState(client,staff){
 const names=['liqa_offices','liqa_notes','liqa_interviews','liqa_tasks','liqa_audit','liqa_staff','liqa_subscriptions'];
 const results=await Promise.all(names.map(name=>client.from(name).select('*').limit(1000)));
 if(results.some(r=>r.error))throw Error('DATA_UNAVAILABLE');
 // Do not silently label an incomplete dashboard as complete.
 if(results.some(r=>r.data.length===1000))throw Error('PAGINATION_REQUIRED');
 const [offices,notes,interviews,tasks,logs,members,subscriptions]=results.map(r=>r.data);
 const people=Object.fromEntries(members.map(m=>[m.user_id,m.display_name]));
 const state={version:1,staff,marketers:members.filter(m=>m.active).map(m=>({id:m.user_id,name:m.display_name})),
 offices:offices.sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(o=>({id:o.id,name:o.name,city:o.city,district:o.district,contact:o.contact,phone:o.phone||'',source:o.source,interest:o.interest,assignee:o.assigned_to,version:o.version,createdAt:day(o.created_at),updatedAt:day(o.updated_at),consentAt:day(o.consent_at),interviewedAt:day(o.interviewed_at),interestedAt:day(o.interested_at),prototypeAt:day(o.prototype_at),trialAt:day(o.trial_at),paidAt:day(subscriptions.find(s=>s.office_id===o.id&&s.status==='active')?.paid_at),notes:notes.filter(n=>n.office_id===o.id).sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(n=>({id:n.id,text:n.text,at:day(n.created_at),author:people[n.actor]||'فريق لِقا'}))})),
 interviews:interviews.map(i=>({id:i.id,officeId:i.office_id,date:day(i.created_at),workflow:i.workflow,pain:i.pain,prices:i.prices,consent:i.research_consent})),
 tasks:tasks.map(t=>({id:t.id,officeId:t.office_id,title:t.title,due:t.due,done:t.done})),
 logs:logs.sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(l=>({id:String(l.id),officeId:l.office_id,at:l.created_at,actor:people[l.actor]||'فريق لِقا',action:l.action})),
 };return state;
}
