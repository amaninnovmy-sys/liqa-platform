import 'server-only';
import {redirect} from 'next/navigation';
import {backendConfigured,serverClient} from '../supabase/server';
import {hasAccess,safeDestination} from '../access.mjs';
export async function currentStaff(){
  if(!backendConfigured())return {status:'setup'};
  const client=await serverClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)return {status:'anonymous'};
  const result=await client.from('liqa_staff').select('user_id,display_name,role,active').eq('user_id',user.id).maybeSingle();
  if(result.error)return {status:'unavailable'};
  if(!hasAccess(result.data))return {status:'forbidden'};
  return {status:'ok',staff:result.data,client};
}
export async function requireStaff(role){
  const session=await currentStaff();
  if(session.status==='setup'||session.status==='unavailable')redirect('/setup/');
  if(session.status!=='ok')redirect('/login/');
  if(!hasAccess(session.staff,role))redirect(safeDestination(session.staff));
  return session;
}
