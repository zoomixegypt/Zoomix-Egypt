// Only localhost. Creates labelled QA records; no real clients, tokens or money.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:8788';
const vars=await readFile('.dev.vars','utf8');
const password=vars.match(/^STUDIO_PASSWORD\s*=\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g,'');
const login=await fetch(`${base}/api/studio/login`,{method:'POST',body:JSON.stringify({password})});assert.equal(login.status,200,'Local sign-in');
const cookie=login.headers.get('set-cookie').split(';')[0];
const call=async(path,data)=>{const response=await fetch(`${base}${path}`,{method:data===undefined?'GET':'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});const result=await response.json();assert.ok(response.ok,`${path}: ${response.status} ${result.error||''}`);return result;};
try {
 const created=await call('/api/studio/quotes',{clientName:'QA Local — غير حقيقي',projectName:'QA Delivery workspace — no real agreement',language:'ar',timeline:'14 QA days',items:[{name:{ar:'خدمة اختبار فقط',en:'QA service only'},description:{ar:'بيانات محلية لا تمثل طلب تنفيذ',en:'Local fixture, no delivery commitment'},quantity:1,unitPrice:1000.01,cost:400}],taxPercent:14,depositPercent:50,revisions:2,conditions:'شروط QA فقط — لا يوجد تعاقد حقيقي',exclusions:'لا يوجد تنفيذ أو تحصيل فعلي',internalNotes:'INTERNAL QA NOTE MUST NOT LEAK',expiryDays:7,paymentSchedule:[{label:'المقدم',percent:50,days:0},{label:'المراجعة',percent:25,days:7},{label:'التسليم',percent:25,days:14}]});
 const quote=created.quote;
 const flag=await fetch(`${base}/api/studio/quotes/${quote.id}/test-mode`,{method:'PATCH',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({isTest:true})});assert.equal(flag.status,200);
 const sent=await call(`/api/studio/quotes/${quote.id}/send`,{});const clientUrl=new URL(sent.clientUrl);clientUrl.host=new URL(base).host;clientUrl.protocol='http:';
 const publicPath=`/api/quotes/${quote.reference}/${clientUrl.pathname.split('/').pop()}`;
 const publicQuote=await call(publicPath);assert.ok(!JSON.stringify(publicQuote).includes('INTERNAL QA NOTE'));
 await call(publicPath,{action:'accept',termsAccepted:true,selectedOptionalItemIds:[]}); // Non-binding, isolated local fixture only.
 const projects=(await call('/api/studio/projects')).projects;const project=projects.find(row=>row.quoteId===quote.id);assert.ok(project);
 await call(`/api/studio/project-workspace/${project.id}`,{projectStatus:'production'});
 await call(`/api/studio/project-workspace/${project.id}`,{type:'task',title:'QA مراجعة التصاميم',detail:'اختبار محلي',owner:'QA Fady',dueAt:new Date(Date.now()+86400000).toISOString()});
 await call(`/api/studio/project-workspace/${project.id}`,{type:'expense',title:'QA مورد',detail:'مصروف تجريبي لا يمثل دفعًا',owner:'QA Supplier',amount:333.33});
 await call(`/api/studio/attachments/${project.id}`,{filename:'qa-pixel.png',contentBase64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX9sAAAAASUVORK5CYII='});
 await call(`/api/studio/documents/${project.id}`,{type:'invoice'});
 await call(`/api/studio/documents/${project.id}`,{type:'contract'});
 const payments=(await call('/api/studio/payments')).payments.filter(row=>row.projectId===project.id);assert.equal(payments.length,3);assert.equal(Math.round(payments.reduce((sum,row)=>sum+row.amount,0)*100),Math.round(project.contractValue*100));
 const timings=[];
 for(let wave=0;wave<5;wave++)await Promise.all(Array.from({length:10},async()=>{const started=performance.now();await call(`/api/studio/project-workspace/${project.id}`);timings.push(performance.now()-started);}));
 timings.sort((a,b)=>a-b);
 console.log(JSON.stringify({environment:'local Cloudflare emulation only',quoteId:quote.id,projectId:project.id,clientUrl:clientUrl.toString(),payments:payments.length,readRequests:timings.length,readConcurrency:10,p95Ms:Math.round(timings[Math.ceil(timings.length*.95)-1]),result:'PASS'},null,2));
} finally { await fetch(`${base}/api/studio/logout`,{method:'POST',headers:{Cookie:cookie}}); }
