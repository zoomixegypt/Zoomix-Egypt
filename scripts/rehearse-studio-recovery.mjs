// Reads an existing backup into memory only. Never writes to production.
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
const path=process.argv[2];if(!path)throw new Error('Provide the path to the SQL backup. No automatic production selection.');
const sql=await readFile(path,'utf8');
const db=new DatabaseSync(':memory:');
try {
 db.exec(sql);
 const baseline=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%migrations%' ORDER BY name").all();
 const counts=Object.fromEntries(baseline.map(({name})=>[name,Number(db.prepare(`SELECT COUNT(*) AS n FROM "${name.replaceAll('"','""')}"`).get().n)]));
 const hasMigrationTable=!!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='d1_migrations'").get();
 const applied=new Set(hasMigrationTable?db.prepare('SELECT name FROM d1_migrations').all().map(row=>row.name):[]);
 let newMigrationsApplied=0;
 for(const name of ['0016_test_data_flags.sql','0017_quote_lifecycle_guards.sql','0018_business_workspaces.sql','0019_full_catalog_drafts.sql','0020_private_attachments.sql']){
  if(applied.has(name))continue;
  db.exec(await readFile(`migrations/${name}`,'utf8'));
  newMigrationsApplied++;
 }
 assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
 for(const name of ['brief_requests','commercial_quotes','commercial_projects','commercial_payments'])assert.equal(Number(db.prepare(`SELECT COUNT(*) AS n FROM ${name}`).get().n),counts[name],'Existing business row count preserved');
 assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 console.log(JSON.stringify({environment:'in-memory recovery rehearsal from production SQL backup',restoredTables:baseline.length,existingCoreRowsPreserved:true,foreignKeyErrors:0,integrity:'ok',newMigrationsApplied,result:'PASS'},null,2));
} finally {db.close();}
