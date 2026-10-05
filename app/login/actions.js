'use server';
import {redirect} from 'next/navigation';
import {serverClient,backendConfigured} from '../../lib/supabase/server';
import {currentStaff} from '../../lib/server/session';
import {safeDestination} from '../../lib/access.mjs';
export async function signIn(previous,form){
  if(!backendConfigured())return {error:'لم يتم ربط بيئة الحسابات بعد. استخدم تجربة العرض فقط.'};
  const email=String(form.get('email')||'').trim();const password=String(form.get('password')||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!password||password.length>512)return {error:'راجع البريد الإلكتروني وكلمة المرور.'};
  let destination;
  try{
    const client=await serverClient();
    const {error}=await client.auth.signInWithPassword({email,password});
    if(error)return {error:'تعذر تسجيل الدخول. راجع البيانات أو حاول لاحقًا.'};
    const session=await currentStaff();
    if(session.status!=='ok'){await client.auth.signOut();return {error:'الحساب غير مخوّل أو غير مفعّل. راجع إدارة لِقا.'};}
    destination=safeDestination(session.staff);
  }catch{return {error:'تعذر الاتصال بخدمة الدخول. حاول لاحقًا.'};}
  redirect(destination);
}
export async function signOut(){
  if(backendConfigured()){const client=await serverClient();await client.auth.signOut();}
  redirect('/login/');
}
