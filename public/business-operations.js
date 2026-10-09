// Supplemental workflows. All routes require the existing Studio session.
const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max);
const timestamp = () => new Date().toISOString();
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const audit = (env, type, id, action, before, after, at) => env.DB.prepare('INSERT INTO commercial_audit_log(entity_type,entity_id,action,before_json,after_json,created_at) VALUES(?,?,?,?,?,?)').bind(type, String(id), action, JSON.stringify(before), JSON.stringify(after), at);
const date = value => !value ? null : Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined;
const httpsLink = value => { if (!value) return ''; try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; } };
export async function limitedJson(request) {
 if(!request.body)throw new Error('Missing request body.');
 const reader=request.body.getReader(),chunks=[];let size=0;
 try { while(true) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1048576){await reader.cancel();throw new Error('Request exceeds 1 MB.');}chunks.push(value);} } finally {reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export function quoteCommercialTerms(payload) {
 const expiryDays = Number(payload.expiryDays ?? 14);
 if (!Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 90) throw new Error('Validity must be 1–90 days.');
 const schedule = payload.paymentSchedule === undefined ? [] : payload.paymentSchedule;
 if (!Array.isArray(schedule) || schedule.length > 12) throw new Error('Up to 12 instalments allowed.');
 const normalized = schedule.map(row => ({ label: clean(row.label, 120), percent: Number(row.percent), days: Number(row.days) }));
 if (normalized.some(row => !row.label || !Number.isFinite(row.percent) || row.percent <= 0 || row.percent > 100 || !Number.isInteger(row.days) || row.days < 0 || row.days > 730) || (normalized.length && Math.abs(normalized.reduce((sum,row)=>sum+row.percent,0)-100)>0.000001)) throw new Error('Instalments must total 100%, with valid names and days.');
 return { conditions: clean(payload.conditions, 6000), exclusions: clean(payload.exclusions, 6000), internalNotes: clean(payload.internalNotes, 6000), expiryDays, paymentSchedule: normalized };
}
export function instalments(total, terms, depositPercent, acceptedAt) {
 const rows = terms.paymentSchedule?.length ? terms.paymentSchedule : [{ label:'Deposit',percent:depositPercent,days:0 },{label:'Balance',percent:100-depositPercent,days:30}].filter(row=>row.percent>0);
 let allocated=0,percent=0;
 return rows.map((row,index)=>{ percent+=row.percent;const cumulative=index===rows.length-1?total:Math.round(total*percent/100);const amount=cumulative-allocated;allocated=cumulative;const due=new Date(acceptedAt); due.setUTCDate(due.getUTCDate()+row.days); due.setUTCHours(23,59,59,999); return {label:row.label,amount,due:due.toISOString(),type:terms.paymentSchedule?.length?'custom':index===0 && depositPercent>0?'deposit':'balance'}; });
}
export async function businessOperations(request,env,authenticate) {
 const url=new URL(request.url), path=url.pathname;
 const match=path.match(/^\/api\/studio\/(lead-operations|project-workspace|payment-details|documents|business-report|attachments)(?:\/(\d+))?$/);
 if(!match) return null;
 const auth=await authenticate(request,env); if(!auth.ok)return response({error:auth.error},auth.status);
 const [,kind,id]=match; const at=timestamp();
 if(request.method==='GET') {
  if(kind==='attachments'&&id) {
   if(url.searchParams.has('download')) {
    const row=await env.DB.prepare('SELECT * FROM commercial_attachments WHERE id=?').bind(id).first();if(!row)return response({error:'Attachment not found.'},404);
    const bytes=Uint8Array.from(atob(row.content_base64),ch=>ch.charCodeAt(0));
    return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(row.filename)}`,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; sandbox"}});
   }
   return response({attachments:(await env.DB.prepare('SELECT id,project_id,payment_id,filename,mime_type,size_bytes,created_at FROM commercial_attachments WHERE project_id=? ORDER BY id DESC').bind(id).all()).results||[]});
  }
  if(kind==='business-report') {
   const projects=(await env.DB.prepare("SELECT p.*,v.terms_json,COALESCE((SELECT SUM(e.amount_minor) FROM commercial_project_entries e WHERE e.project_id=p.id AND e.entry_type='expense' AND e.status!='cancelled'),0) actual_cost_minor FROM commercial_projects p JOIN commercial_quotes q ON q.id=p.quote_id JOIN commercial_quote_versions v ON v.quote_id=q.id AND v.version_number=q.current_version WHERE q.is_test=0").all()).results||[];
   const losses=(await env.DB.prepare("SELECT o.loss_reason,COUNT(*) count FROM commercial_lead_operations o JOIN brief_requests b ON b.id=o.brief_id WHERE b.is_test=0 AND o.loss_reason!='' GROUP BY o.loss_reason").all()).results||[];
   const sources=(await env.DB.prepare("SELECT source,COUNT(*) count FROM brief_requests WHERE is_test=0 GROUP BY source").all()).results||[];
   return response({projects:projects.map(p=>({id:p.id,name:p.project_name,expectedCost:p.expected_cost_minor/100,recordedCost:p.actual_cost_minor/100,netValue:Math.round(p.contract_value_minor/(1+Number(JSON.parse(p.terms_json||'{}').taxPercent||0)/100))/100})),losses,sources});
  }
  if(kind==='lead-operations') return response({rows:(await env.DB.prepare('SELECT * FROM commercial_lead_operations').all()).results||[]});
  if(kind==='project-workspace' && id) {
   const project=await env.DB.prepare('SELECT p.*,q.is_test FROM commercial_projects p JOIN commercial_quotes q ON q.id=p.quote_id WHERE p.id=?').bind(id).first();
   if(!project)return response({error:'Project not found.'},404);
   const entries=(await env.DB.prepare('SELECT * FROM commercial_project_entries WHERE project_id=? ORDER BY id DESC').bind(id).all()).results||[];
   const docs=(await env.DB.prepare('SELECT * FROM commercial_documents WHERE project_id=? ORDER BY id DESC').bind(id).all()).results||[];
   return response({project,entries,documents:docs});
  }
  if(kind==='payment-details' && id) { const payment=await env.DB.prepare('SELECT * FROM commercial_payments WHERE id=?').bind(id).first(); return payment?response({payment}):response({error:'Payment not found.'},404); }
  if(kind==='documents' && id) { const document=await env.DB.prepare('SELECT * FROM commercial_documents WHERE id=?').bind(id).first(); return document?response({document}):response({error:'Document not found.'},404); }
 }
 if(!['POST','PATCH'].includes(request.method) || !id)return response({error:'Method not allowed.'},405);
 let data;try{data=await limitedJson(request);if(!data || typeof data!=='object' || Array.isArray(data))throw Error();}catch{return response({error:'Invalid body or request exceeds 1 MB.'},400);}
 if(kind==='attachments') {
  const project=await env.DB.prepare('SELECT id FROM commercial_projects WHERE id=?').bind(id).first();if(!project)return response({error:'Project not found.'},404);
  const payment=data.paymentId?await env.DB.prepare('SELECT id FROM commercial_payments WHERE id=? AND project_id=?').bind(data.paymentId,id).first():null;
  if(data.paymentId&&!payment)return response({error:'Payment does not belong to this project.'},400);
  const encoded=typeof data.contentBase64==='string'?data.contentBase64:'';
  if(encoded.length>700000)return response({error:'Attachment limit: 512 KB.'},413);
  let bytes;try{bytes=atob(encoded);}catch{return response({error:'Invalid file encoding.'},400);}
  const mime=bytes.startsWith('%PDF-')?'application/pdf':bytes.startsWith('\x89PNG\r\n\x1a\n')?'image/png':bytes.startsWith('\xff\xd8\xff')?'image/jpeg':null;
  const filename=clean(data.filename,180).replace(/[\x00-\x1f/\\]/g,'_');
  if(!mime||!filename||bytes.length<1||bytes.length>524288)return response({error:'Only PDF, PNG or JPEG files up to 512 KB are supported.'},400);
  const result=await env.DB.batch([env.DB.prepare('INSERT INTO commercial_attachments(project_id,payment_id,filename,mime_type,size_bytes,content_base64,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,payment?.id||null,filename,mime,bytes.length,encoded,at),audit(env,'project',id,'attachment_added',null,{filename,size:bytes.length,paymentId:payment?.id||null},at)]);
  return response({ok:true,id:result[0]?.meta?.last_row_id},201);
 }
 if(kind==='lead-operations') {
  const brief=await env.DB.prepare('SELECT id FROM brief_requests WHERE id=?').bind(id).first();if(!brief)return response({error:'Lead not found.'},404);
  const follow=date(data.followUpAt);if(follow===undefined)return response({error:'Invalid follow-up date.'},400);
  const before=await env.DB.prepare('SELECT * FROM commercial_lead_operations WHERE brief_id=?').bind(id).first();
  const row={owner:clean(data.owner,120),followUpAt:follow,lossReason:clean(data.lossReason,1000)};
  await env.DB.batch([env.DB.prepare('INSERT INTO commercial_lead_operations(brief_id,owner,follow_up_at,loss_reason,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(brief_id) DO UPDATE SET owner=excluded.owner,follow_up_at=excluded.follow_up_at,loss_reason=excluded.loss_reason,updated_at=excluded.updated_at').bind(id,row.owner,follow,row.lossReason,at),audit(env,'brief',id,'follow_up_updated',before,row,at)]);
  return response({ok:true});
 }
 if(kind==='project-workspace') {
  const project=await env.DB.prepare('SELECT * FROM commercial_projects WHERE id=?').bind(id).first();if(!project)return response({error:'Project not found.'},404);
  if(data.projectStatus) { if(!['confirmed','planning','production','review','delivered','closed'].includes(data.projectStatus))return response({error:'Invalid project phase.'},400);await env.DB.batch([env.DB.prepare('UPDATE commercial_projects SET status=?,updated_at=? WHERE id=?').bind(data.projectStatus,at,id),audit(env,'project',id,'phase_updated',{status:project.status},{status:data.projectStatus},at)]);return response({ok:true}); }
  if(data.entryId) {
   const entry=await env.DB.prepare('SELECT * FROM commercial_project_entries WHERE id=? AND project_id=?').bind(data.entryId,id).first();if(!entry)return response({error:'Entry not found.'},404);
   if(!['open','done','cancelled'].includes(data.status))return response({error:'Invalid entry status.'},400);
   await env.DB.batch([env.DB.prepare('UPDATE commercial_project_entries SET status=?,updated_at=? WHERE id=? AND project_id=?').bind(data.status,at,data.entryId,id),audit(env,'project',id,'entry_status',entry,{entryId:data.entryId,status:data.status},at)]);return response({ok:true});
  }
  const type=clean(data.type),title=clean(data.title,180),due=date(data.dueAt),amount=Number(data.amount??0),detail=clean(data.detail,2000);
  if(!['task','file','expense','team'].includes(type)||!title||due===undefined||!Number.isFinite(amount)||amount<0||amount>10000000 || (type==='file'&&!httpsLink(detail)))return response({error:'Invalid entry. File links must use HTTPS.'},400);
  await env.DB.batch([env.DB.prepare('INSERT INTO commercial_project_entries(project_id,entry_type,title,detail,owner,due_at,amount_minor,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,type,title,detail,clean(data.owner,120),due,type==='expense'?Math.round(amount*100):0,at,at),audit(env,'project',id,'entry_added',null,{type,title},at)]);return response({ok:true},201);
 }
 if(kind==='payment-details') {
  const payment=await env.DB.prepare('SELECT * FROM commercial_payments WHERE id=?').bind(id).first();if(!payment)return response({error:'Payment not found.'},404);
  const receipt=httpsLink(data.receiptUrl);if(receipt===null)return response({error:'Receipt must be an HTTPS link.'},400);
  await env.DB.batch([env.DB.prepare('UPDATE commercial_payments SET method=?,collection_reference=?,receipt_url=?,updated_at=? WHERE id=?').bind(clean(data.method,120),clean(data.reference,180),receipt,at,id),audit(env,'payment',id,'collection_details',payment,{method:clean(data.method,120),reference:clean(data.reference,180),receiptUrl:receipt},at)]);return response({ok:true});
 }
 if(kind==='documents') {
  const project=await env.DB.prepare('SELECT p.*,q.is_test,v.terms_json,v.tax_minor FROM commercial_projects p JOIN commercial_quotes q ON q.id=p.quote_id JOIN commercial_quote_versions v ON v.quote_id=q.id AND v.version_number=q.current_version WHERE p.id=?').bind(id).first();if(!project)return response({error:'Project not found.'},404);
  if(!['invoice','receipt','contract'].includes(data.type))return response({error:'Invalid document type.'},400);
  const payment=data.paymentId?await env.DB.prepare('SELECT * FROM commercial_payments WHERE id=? AND project_id=?').bind(data.paymentId,id).first():null;
  if(data.type==='receipt'&&(!payment||payment.status!=='paid'))return response({error:'Receipts require a paid payment from this project.'},409);
  const ref=`${data.type.toUpperCase()}-${crypto.randomUUID().slice(0,12).toUpperCase()}`;
  const terms=JSON.parse(project.terms_json||'{}');
  const acceptance=await env.DB.prepare("SELECT selection_json FROM commercial_quote_events WHERE quote_id=? AND event_type='accepted' ORDER BY id DESC LIMIT 1").bind(project.quote_id).first();
  const selected=JSON.parse(acceptance?.selection_json||'{}').selectedOptionalItemIds||[];
  const items=(await env.DB.prepare('SELECT i.* FROM commercial_quote_items i JOIN commercial_quote_versions v ON v.id=i.quote_version_id JOIN commercial_quotes q ON q.id=v.quote_id WHERE q.id=? AND v.version_number=q.current_version ORDER BY i.sort_order').bind(project.quote_id).all()).results||[];
  const scope=items.filter(row=>!row.optional||selected.includes(Number(row.id))).map(row=>({name:{ar:row.name_ar,en:row.name_en},description:{ar:row.description_ar,en:row.description_en},quantity:row.quantity,unitPriceMinor:row.unit_price_minor,lineTotalMinor:Math.max(0,Math.round(row.unit_price_minor*row.quantity)-row.discount_minor)}));
  const subtotal=scope.reduce((sum,row)=>sum+row.lineTotalMinor,0), net=Math.round(project.contract_value_minor/(1+Number(terms.taxPercent||0)/100));
  // Deliberately public-safe snapshots: never include costs, internal notes or secure client tokens.
  const snapshot={reference:ref,type:data.type,createdAt:at,isTest:Boolean(project.is_test),clientName:project.client_name,projectName:project.project_name,projectReference:project.reference_code,totalMinor:data.type==='receipt'?payment.amount_minor:project.contract_value_minor,scope:data.type==='receipt'?[]:scope,subtotalMinor:subtotal,discountMinor:Math.max(0,subtotal-net),taxMinor:project.contract_value_minor-net,conditions:terms.conditions||'',exclusions:terms.exclusions||'',paymentSchedule:terms.paymentSchedule||[],method:payment?.method||'',collectionReference:payment?.collection_reference||'',notice:'Operational document only. Not a certified tax invoice or electronic signature.'};
  await env.DB.batch([env.DB.prepare('INSERT INTO commercial_documents(project_id,payment_id,document_type,reference,snapshot_json,created_at) VALUES(?,?,?,?,?,?)').bind(id,payment?.id||null,data.type,ref,JSON.stringify(snapshot),at),audit(env,'project',id,'document_created',null,{reference:ref,type:data.type},at)]);
  return response({document:await env.DB.prepare('SELECT * FROM commercial_documents WHERE reference=?').bind(ref).first()},201);
 }
 return response({error:'Method not allowed.'},405);
}
