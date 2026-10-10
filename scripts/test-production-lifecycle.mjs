// Explicitly authorized production QA only. Never writes existing customer records.
import assert from 'node:assert/strict';
if(process.env.QA_PRODUCTION_CYCLE!=='approved' || !process.env.QA_STUDIO_PASSWORD) throw Error('Explicit QA approval and password required');
const origin='https://zoomixegypt.com', checks=[], ids={}; let cookie='';
const request=async(path,data,method=data===undefined?'GET':'POST',auth=true)=>{
 const r=await fetch(origin+path,{method,headers:{...(auth?{Cookie:cookie}:{}),'Content-Type':'application/json',Origin:origin},...(data===undefined?{}:{body:JSON.stringify(data)}),signal:AbortSignal.timeout(30000)});
 const text=await r.text();let body;try{body=JSON.parse(text);}catch{body={};}return {status:r.status,body,headers:r.headers};
};
const ok=async(name,path,data,method,auth)=>{const r=await request(path,data,method,auth);assert.ok(r.status>=200&&r.status<300,`${name}: HTTP ${r.status} ${r.body.error||''}`);checks.push(name);return r.body;};
const denied=async(name,status,path,data,method,auth)=>{const r=await request(path,data,method,auth);assert.equal(r.status,status,name);checks.push(name);};
const prove=(name,value)=>{assert.ok(value,name);checks.push(name);};
try{
 const login=await request('/api/studio/login',{password:process.env.QA_STUDIO_PASSWORD});assert.equal(login.status,200,'login');cookie=login.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);checks.push('Production login');
 for(const path of ['requests','catalog','quotes','projects','payments','promotions','audit','insights','business-report']) {await ok(`Protected ${path}`,`/api/studio/${path}`);await denied(`Anonymous ${path}`,401,`/api/studio/${path}`,undefined,'GET',false);}
 const label=`QA-CYCLE-${new Date().toISOString().replace(/[:.]/g,'-')}`;
 const brief=await ok('Complete public request','/api/briefs',{name:label,project:`${label} — non-binding test`,phone:'+12025550199',contactPreference:'whatsapp',preferredTime:'12:00',activity:'QA cafe — fictitious',service:'ORIGIN',route:'start',offerId:'origin',offerName:'ORIGIN',stage:'new',budget:'5000-10000',launchDate:'Within a month',source:'QA production lifecycle',projectLink:'https://example.com/qa',goal:'QA only; no real delivery or money',description:'اختبار دورة التشغيل فقط — بيانات غير حقيقية، لا تتواصل مع الرقم ولا تنفذ مشروعًا.',consent:true},'POST',false);
 const leads=(await ok('Request persisted','/api/studio/requests')).requests;const lead=leads.find(r=>r.reference_code===brief.referenceCode);assert.ok(lead);ids.briefId=lead.id;
 await ok('Classify new QA before downstream work',`/api/studio/requests/${lead.id}`,{isTest:true},'PATCH');
 await ok('Assign owner and follow-up',`/api/studio/lead-operations/${lead.id}`,{owner:'QA Administrator',followUpAt:new Date(Date.now()+86400000).toISOString()});
 const input={briefRequestId:lead.id,clientName:label,projectName:`${label} — non-binding test`,language:'ar',timeline:'14 QA days',items:[{name:{ar:'خدمة اختبار',en:'QA service'},description:{ar:'لا يوجد التزام حقيقي',en:'No real commitment'},quantity:1,unitPrice:1000.01,cost:400}],taxPercent:14,depositPercent:50,revisions:2,conditions:'QA only — not a real agreement',exclusions:'No real service or money',internalNotes:'QA-INTERNAL-NEVER-SHARE',expiryDays:7,paymentSchedule:[{label:'QA deposit',percent:50,days:0},{label:'QA review',percent:25,days:7},{label:'QA delivery',percent:25,days:14}]};
 await denied('Invalid instalment sum rejected',400,'/api/studio/quotes',{...input,paymentSchedule:[{label:'QA',percent:80,days:0}]});
 await denied('Invalid promo rejected',400,'/api/studio/quotes',{...input,promoCode:'QA-NO-SUCH-CODE'});
 const created=await ok('Create linked quote','/api/studio/quotes',input);const quote=created.quote;ids.quoteId=quote.id;prove('Quote inherits QA flag',quote.isTest);
 const send=()=>ok('Send QA quote',`/api/studio/quotes/${quote.id}/send`,{});
 let sent=await send();const publicPath=url=>`/api/quotes/${quote.reference}/${new URL(url).pathname.split('/').pop()}`;let path=publicPath(sent.clientUrl);
 const publicQuote=await ok('Client opens quote',path,undefined,'GET',false);prove('Internal notes and cost remain private',!JSON.stringify(publicQuote).includes('QA-INTERNAL-NEVER-SHARE')&&!JSON.stringify(publicQuote).includes('internalCost'));
 await denied('Terms required',400,path,{action:'accept',termsAccepted:false},'POST',false);
 await denied('Revision message required',400,path,{action:'revision',message:''},'POST',false);
 await ok('Client requests revision',path,{action:'revision',message:'QA only: adjust timeline to 16 days'},'POST',false);
 await ok('Save version 2',`/api/studio/quotes/${quote.id}/versions`,{...input,timeline:'16 QA days',baseVersion:1});
 await denied('Stale editor prevented',409,`/api/studio/quotes/${quote.id}/versions`,{...input,baseVersion:1});
 sent=await send();path=publicPath(sent.clientUrl);
 await ok('Client reads current quote',path,undefined,'GET',false);
 await ok('Accept non-binding flagged QA fixture',path,{action:'accept',termsAccepted:true,selectedOptionalItemIds:[]},'POST',false);
 await denied('Duplicate acceptance prevented',409,path,{action:'accept',termsAccepted:true,selectedOptionalItemIds:[]},'POST',false);
 const projects=(await ok('Projects persisted','/api/studio/projects')).projects;const project=projects.find(r=>r.quoteId===quote.id);assert.ok(project);ids.projectId=project.id;prove('One QA project only',projects.filter(r=>r.quoteId===quote.id).length===1&&project.isTest);
 const payments=(await ok('Payments persisted','/api/studio/payments')).payments.filter(r=>r.projectId===project.id);prove('Three exact QA instalments',payments.length===3&&payments.every(r=>r.isTest)&&Math.round(payments.reduce((s,r)=>s+r.amount,0)*100)===Math.round(project.contractValue*100));ids.paymentIds=payments.map(r=>r.id);
 const workspace=`/api/studio/project-workspace/${project.id}`;
 await denied('Invalid project phase rejected',400,workspace,{projectStatus:'INVALID'});
 await ok('Planning phase',workspace,{projectStatus:'planning'});
 await ok('Add task',workspace,{type:'task',title:'QA design review',owner:'QA Administrator',detail:'Synthetic work only',dueAt:new Date(Date.now()+86400000).toISOString()});
 await ok('Add team assignment',workspace,{type:'team',title:'QA Designer',owner:'QA Administrator',detail:'No real person assigned'});
 await ok('Record fictitious expense',workspace,{type:'expense',title:'QA expense — no money moved',amount:333.33});
 await denied('Unsafe file link rejected',400,workspace,{type:'file',title:'QA unsafe',detail:'javascript:alert(1)'});
 await ok('Add safe delivery link',workspace,{type:'file',title:'QA delivery link',detail:'https://example.com/qa-delivery'});
 const attachment=await ok('Upload private QA PNG',`/api/studio/attachments/${project.id}`,{filename:'qa-pixel.png',contentBase64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX9sAAAAASUVORK5CYII='});ids.attachmentId=attachment.id;
 await denied('Anonymous attachment denied',401,`/api/studio/attachments/${attachment.id}?download=1`,undefined,'GET',false);
 const download=await request(`/api/studio/attachments/${attachment.id}?download=1`);prove('Private download forced attachment',download.status===200&&download.headers.get('content-disposition')?.startsWith('attachment'));
 for(const type of ['invoice','contract']) {const result=await ok(`Generate QA ${type}`,`/api/studio/documents/${project.id}`,{type});prove(`${type} snapshot privacy`,!result.document.snapshot_json.includes('QA-INTERNAL-NEVER-SHARE'));}
 await denied('Unpaid receipt blocked',409,`/api/studio/documents/${project.id}`,{type:'receipt',paymentId:payments[0].id});
 for(const payment of payments){await ok('QA collection details',`/api/studio/payment-details/${payment.id}`,{method:'QA ONLY — no bank transfer',reference:label,receiptUrl:'https://example.com/qa-receipt'});await ok('Record simulated QA paid',`/api/studio/payments/${payment.id}`,{status:'paid'},'PATCH');await ok('Generate QA receipt',`/api/studio/documents/${project.id}`,{type:'receipt',paymentId:payment.id});}
 const state=await ok('Read workspace entries',workspace);const task=state.entries.find(r=>r.entry_type==='task');await ok('Complete QA task',workspace,{entryId:task.id,status:'done'});
 for(const phase of ['production','review','delivered','closed'])await ok(`Project phase ${phase}`,workspace,{projectStatus:phase});
 const final=await ok('Verify persisted closed workspace',workspace);prove('Closed and task done',final.project.status==='closed'&&final.entries.some(r=>r.id===task.id&&r.status==='done'));prove('All QA documents persisted',final.documents.length===5);
 const report=await ok('Read business report','/api/studio/business-report');prove('QA excluded from actual business report',!report.projects.some(r=>r.id===project.id));
 const latest=(await ok('Verify collection state','/api/studio/payments')).payments.filter(r=>r.projectId===project.id);prove('QA collections persisted',latest.every(r=>r.status==='paid'&&r.isTest));
}catch(error){console.log(JSON.stringify({result:'FAIL',completed:checks.length,ids,error:error.message,checks},null,2));process.exitCode=1;}
finally{if(cookie){await request('/api/studio/logout',{});const r=await request('/api/studio/session');if(r.status===401)checks.push('Logout invalidates dedicated session');}}
if(!process.exitCode)console.log(JSON.stringify({result:'PASS',environment:'production; synthetic QA only; no money transferred',completed:checks.length,ids,checks},null,2));
