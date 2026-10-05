import {createServerClient} from '@supabase/ssr';
import {NextResponse} from 'next/server';
export async function proxy(request){
  if(process.env.LIQA_BACKEND_ENABLED!=='true'||!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return NextResponse.next();
  let response=NextResponse.next({request});
  const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{
    cookies:{getAll(){return request.cookies.getAll()},setAll(values){
      values.forEach(({name,value})=>request.cookies.set(name,value));
      response=NextResponse.next({request});
      values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
    }},
  });
  try{await client.auth.getUser()}catch{/* Protected routes independently fail closed. */}
  response.headers.set('Cache-Control','private, no-store');
  return response;
}
export const config={matcher:['/admin/:path*','/marketer/:path*','/login/:path*','/api/console/:path*']};
