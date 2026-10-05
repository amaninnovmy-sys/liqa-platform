import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
test('admin and marketer render without runtime errors and fit viewport',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const role of ['admin','marketer']){
  await page.goto(`/demo/${role}/`);
  await expect(page.locator('h1')).toContainText(role==='admin'?'لوحة إدارة':'لوحة تحكم');
  await expect(page.locator('tbody tr').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
  await fs.mkdir('previews',{recursive:true});
  await page.screenshot({path:`previews/${info.project.name}-${role}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});
test('register demo office, retain on reload, and filter',async({page})=>{
 await page.goto('/demo/marketer/');
 await page.getByRole('button',{name:'إضافة مكتب',exact:true}).click();
 const d=page.getByRole('dialog');
 await d.locator('[name=name]').fill('مكتب اختبار الزيارة');
 await d.locator('[name=contact]').fill('مسؤول تجريبي');
 await d.locator('[name=consent]').check();
 await d.getByRole('button',{name:'حفظ',exact:true}).click();
 await expect(d).not.toBeVisible();
 await page.reload();
 await page.getByLabel('بحث في المكاتب',{exact:true}).fill('مكتب اختبار الزيارة');
 await expect(page.locator('tbody tr')).toHaveCount(1);
 await expect(page.locator('tbody')).toContainText('تم التسجيل');
});
test('interview prices require ordered complete input',async({page})=>{
 await page.goto('/demo/admin/');await page.getByRole('button',{name:'تسجيل مقابلة',exact:true}).click();
 const d=page.getByRole('dialog');await d.locator('[name=researchConsent]').check();
 for(const [key,val] of Object.entries({p1:'200',p2:'100',p3:'300',p4:'400'}))await d.locator(`[name=${key}]`).fill(val);
 await d.getByRole('button',{name:'حفظ',exact:true}).click();
 await expect(d.getByRole('alert')).toContainText('ترتيب');
 await d.locator('[name=p1]').fill('50');await d.getByRole('button',{name:'حفظ',exact:true}).click();
 await expect(d).not.toBeVisible();
});
test('production routes fail closed when backend is unconfigured',async({page,request})=>{
 await page.goto('/admin/');await expect(page).toHaveURL(/\/setup\//);await expect(page.locator('h1')).toContainText('قيد التجهيز');
 await page.goto('/marketer/');await expect(page).toHaveURL(/\/setup\//);
 await page.goto('/login/');await expect(page.getByRole('button',{name:'تسجيل الدخول',exact:true})).toBeDisabled();
 const response=await request.get('/api/console/');expect(response.status()).toBe(503);
 const bad=await request.post('/api/console/',{headers:{Origin:'https://wrong.example'},data:{action:'create'}});expect(bad.status()).toBe(403);
});
