// Isolated UI test server. No database, Telegram, email or production proxy.
// Bind loopback only; records stay in memory and disappear on shutdown.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("build");
let submissions = 0;
const types = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".woff2":"font/woff2" };
const json = (res, status, data) => {res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(JSON.stringify(data));};
createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,"http://127.0.0.1:5175");
    if(url.pathname==="/api/briefs" && req.method==="POST") {
      let body="";
      for await(const chunk of req) {body+=chunk;if(body.length>50000){json(res,413,{error:"Too large"});return;}}
      const data=JSON.parse(body);
      submissions++;
      console.log(`QA POST count=${submissions} channel=${data.contactPreference} scenario=${data.project}`);
      await new Promise(resolve=>setTimeout(resolve,1500));
      if(data.project==="QA FAIL") {json(res,503,{error:"Isolated failure"});return;}
      if(!data.name || !data.description || !data.consent) {json(res,400,{error:"Required fields"});return;}
      json(res,201,{ok:true,referenceCode:`ZMX-QA-${String(submissions).padStart(3,"0")}`,editUrl:""});return;
    }
    if(url.pathname==="/api/qa-status") {json(res,200,{submissions,isolated:true});return;}
    if(url.pathname.startsWith("/api/")) {json(res,200,{});return;}
    if(req.method!=="GET") {json(res,405,{});return;}
    let file=resolve(root,"."+decodeURIComponent(url.pathname));
    if(file!==root && !file.startsWith(root+sep)) {json(res,403,{});return;}
    if(url.pathname.endsWith("/")) file=resolve(file,"index.html");
    let bytes;
    try {bytes=await readFile(file);} catch {if(extname(file)){json(res,404,{});return;} file=resolve(root,"index.html");bytes=await readFile(file);}
    res.writeHead(200,{"Content-Type":types[extname(file)] || "application/octet-stream","Cache-Control":"no-store"});res.end(bytes);
  } catch {json(res,500,{error:"QA server error"});}
}).listen(5175,"127.0.0.1",()=>console.log("ISOLATED QA http://127.0.0.1:5175 — no external notifications or persistence"));
