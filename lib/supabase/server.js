import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export function backendConfigured(){return process.env.LIQA_BACKEND_ENABLED==='true'&&!!process.env.NEXT_PUBLIC_SUPABASE_URL&&!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;}
export async function serverClient(){
  if(!backendConfigured())throw Error('BACKEND_NOT_CONFIGURED');
  const jar=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{
    cookies:{getAll(){return jar.getAll()},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Read-only RSC cookies are refreshed by proxy.js. */}}},
  });
}
