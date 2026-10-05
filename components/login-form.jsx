'use client';
import {useActionState} from 'react';
import {signIn} from '../app/login/actions';
export default function LoginForm({configured}){
 const [state,action,pending]=useActionState(signIn,{});
 return <form action={action} className="modal-body"><label>البريد الإلكتروني<input name="email" type="email" autoComplete="username" required maxLength={254} disabled={!configured}/></label><label>كلمة المرور<input name="password" type="password" autoComplete="current-password" required maxLength={512} disabled={!configured}/></label>{state.error&&<p role="alert" className="warning">{state.error}</p>}<button className="primary full" disabled={!configured||pending}>{pending?'جارٍ التحقق…':'تسجيل الدخول'}</button><p className="hint">حسابات الفريق تُعتمد بواسطة الإدارة. لا يمنح التسجيل الذاتي صلاحية الأدمن أو المسوق.</p></form>;
}
