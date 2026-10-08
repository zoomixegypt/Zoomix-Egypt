// Production diagnostics. No credentials, tokens or customer records are printed.
// Optional reminder dispatch is gated to an exclusively QA overdue dataset.
const origin='https://zoomixegypt.com';
const results=[];
let cookie='';
const check=async(name,expected,run)=>{try{const actual=await run();results.push({name,expected,actual,result:actual===expected?'PASS':'FAIL'});}catch(e){results.push({name,expected,actual:String(e.message),result:'FAIL'});}};
const call=(path,options={},auth=true)=>fetch(origin+path,{...options,headers:{...(auth?{Cookie:cookie}:{}),...(options.body?{'Content-Type':'application/json'}:{}),...options.headers},redirect:'manual'});
await check('wrong password rejected',401,async()=> (await call('/api/studio/login',{method:'POST',body:JSON.stringify({password:'QA-definitely-wrong-password'})},false)).status);
const login=await call('/api/studio/login',{method:'POST',body:JSON.stringify({password:process.env.QA_STUDIO_PASSWORD})},false);
if(login.status!==200)throw new Error(`Production login failed (${login.status})`);
cookie=login.headers.get('set-cookie')?.split(';')[0];
if(!cookie)throw new Error('No session cookie');
try{
 for(const p of ['session','requests','catalog','quotes','projects','payments','promotions','integrations','audit','insights','export.csv','backup.json']){
  await check(`protected read:${p}`,200,async()=> (await call(`/api/studio/${p}`)).status);
  await check(`anonymous rejected:${p}`,401,async()=> (await call(`/api/studio/${p}`,{},false)).status);
 }
 for(const[path,method]of [['catalog','POST'],['quotes','POST'],['promotions','POST'],['payments/1','PATCH'],['requests/10','PATCH'],['quotes/3/versions','POST'],['quotes/3/send','POST'],['integrations/telegram/test','POST'],['payments/reminders','POST']])await check(`anonymous write rejected:${path}`,401,async()=> (await call(`/api/studio/${path}`,{method,body:'{}'},false)).status);
 const catalog=await(await call('/api/catalog',{},false)).json();
 await check('QA catalog hidden publicly',0,()=>catalog.items.filter(r=>r.id.startsWith('qa-audit-')).length);
 await check('public catalog contains no internal costs',false,()=>catalog.items.some(r=>'cost' in r || 'minimumPrice' in r));
 const projects=(await(await call('/api/studio/projects')).json()).projects;
 const payments=(await(await call('/api/studio/payments')).json()).payments;
 await check('QA06 exactly one project',1,()=>projects.filter(p=>p.quoteId===2).length);
 await check('QA06 two payments',2,()=>payments.filter(p=>projects.some(j=>j.quoteId===2 && j.id===p.projectId)).length);
 await check('QA06 no recorded collections',0,()=>payments.filter(p=>p.status==='paid' && projects.some(j=>j.quoteId===2 && j.id===p.projectId)).length);
 const responses=await(await call('/api/studio/requests')).json();
 const qa=responses.requests.find(r=>r.id===10);
 if(qa?.reference_code!=='ZMX-2026-EDF9BF')throw new Error('QA request identity mismatch');
 if(process.env.QA_CLASSIFY_EXISTING==='1'){
  const expected=[[5,'ZMX-2026-B8454B'],[6,'ZMX-2026-5E9F87'],[7,'ZMX-2026-072945'],[8,'ZMX-2026-0EC1EB'],[9,'ZMX-2026-780E3A'],[10,'ZMX-2026-EDF9BF']];
  if(expected.some(([id,ref])=>responses.requests.find(r=>r.id===id)?.reference_code!==ref))throw new Error('QA classification identity mismatch');
  for(const[id]of expected)await check(`classify known QA brief:${id}`,200,async()=> (await call(`/api/studio/requests/${id}`,{method:'PATCH',body:JSON.stringify({isTest:true,...(id===10?{status:'won'}:{})})})).status);
  const quotes=(await(await call('/api/studio/quotes')).json()).quotes;
  if(quotes.find(q=>q.id===3)?.reference!=='QT-2026-71453D')throw new Error('QA quote classification identity mismatch');
  await check('classify known QA quote3',200,async()=> (await call('/api/studio/quotes/3/test-mode',{method:'PATCH',body:JSON.stringify({isTest:true})})).status);
  const latestProjects=(await(await call('/api/studio/projects')).json()).projects;
  await check('QA project excluded from reporting',true,()=>latestProjects.filter(p=>p.quoteId===2).every(p=>p.isTest));
  const latestPayments=(await(await call('/api/studio/payments')).json()).payments;
  await check('QA payments inherit exclusion',true,()=>latestPayments.filter(p=>latestProjects.some(j=>j.quoteId===2 && j.id===p.projectId)).every(p=>p.isTest));
 }
 const backupResponse=await call('/api/studio/backup.json');
 const backup=JSON.parse((await backupResponse.text()).replace(/^\uFEFF/,''));
 await check('backup business table coverage',13,()=>Object.keys(backup.tables||{}).length);
 await check('backup excludes sessions',false,()=> 'studio_sessions' in (backup.tables||{}));
 await check('null quote body rejected safely',400,async()=> (await call('/api/studio/quotes',{method:'POST',body:'null'})).status);
 const detail=(await(await call('/api/studio/quotes/3')).json()).draft;
 const validationPayload={clientName:detail.clientName,projectName:detail.projectName,items:detail.items,timeline:detail.duration,taxPercent:detail.taxPercent,depositPercent:detail.depositPercent,revisions:detail.revisions,baseVersion:detail.record.version};
 await check('missing duration rejected live',400,async()=> (await call('/api/studio/quotes/3/versions',{method:'POST',body:JSON.stringify({...validationPayload,timeline:''})})).status);
 await check('unknown catalog rejected live',400,async()=> (await call('/api/studio/quotes',{method:'POST',body:JSON.stringify({...validationPayload,items:[{...detail.items[0],catalogId:'QA-never-existing-id'}]})})).status);
 await check('request invalid status rejected',400,async()=> (await call('/api/studio/requests/10',{method:'PATCH',body:JSON.stringify({status:'INVALID-QA'})})).status);
 const originalNotes=qa.notes||'';
 await check('QA request notes update',200,async()=> (await call('/api/studio/requests/10',{method:'PATCH',body:JSON.stringify({notes:'QA API test only; no customer contact.'})})).status);
 await check('QA request notes read-back',true,async()=> (await(await call('/api/studio/requests')).json()).requests.find(r=>r.id===10).notes==='QA API test only; no customer contact.');
 await check('QA request notes restore',200,async()=> (await call('/api/studio/requests/10',{method:'PATCH',body:JSON.stringify({notes:originalNotes})})).status);
 const overdue=payments.filter(p=>['pending','overdue'].includes(p.status) && p.dueAt && Date.parse(p.dueAt)<=Date.now());
 if(process.env.QA_SEND_REMINDER==='1'){
  if(!overdue.length || overdue.some(p=>!projects.some(j=>j.quoteId===2 && j.id===p.projectId)))throw new Error('Reminder safety gate: due payments are not exclusively QA06');
  await check('real reminder dispatch configured',200,async()=> (await call('/api/studio/payments/reminders',{method:'POST',body:'{}'})).status);
  await check('repeat reminder suppressed',0,async()=> (await(await call('/api/studio/payments/reminders',{method:'POST',body:'{}'})).json()).remindersSent);
 }
 await check('unknown API route returns 404',404,async()=> (await call('/api/studio/qa-unknown')).status);
}finally{
 await check('dedicated API session logout',200,async()=> (await call('/api/studio/logout',{method:'POST',body:'{}'})).status);
 await check('logged-out session rejected',401,async()=> (await call('/api/studio/session')).status);
}
console.log(JSON.stringify({environment:'production API; QA notes update/restore; guarded QA reminder dispatch',total:results.length,passed:results.filter(r=>r.result==='PASS').length,failed:results.filter(r=>r.result==='FAIL').length,results},null,2));
if(results.some(r=>r.result==='FAIL'))process.exitCode=1;
