import Link from 'next/link';
import {Brand} from '../../components/icons';
import LoginForm from '../../components/login-form';
import {backendConfigured} from '../../lib/supabase/server';
export const dynamic='force-dynamic';
export default function Login(){const configured=backendConfigured();return <main className="landing"><section className="landing-panel" style={{maxWidth:600}}><div className="landing-top"><Brand/><h1>أهلًا بك في لِقا</h1><p>دخول فريق الإدارة والتسويق الميداني</p></div><div className="landing-body">{!configured&&<p className="warning">الاتصال بالحسابات لم يُفعّل بعد. لن تُرسل أو تُحفظ بيانات دخول من هذه الصفحة.</p>}<LoginForm configured={configured}/><Link className="small-button" href="/">العودة لتجربة العرض</Link></div></section></main>}
