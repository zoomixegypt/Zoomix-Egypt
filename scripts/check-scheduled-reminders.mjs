// Read-only Cloudflare diagnostics. Never dispatches reminders or prints credentials.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const account = process.argv[2];
if (!/^[a-f0-9]{32}$/.test(account || '')) throw new Error('Provide the Cloudflare account ID.');
const configPath = join(process.env.APPDATA, 'xdg.config', '.wrangler', 'config', 'default.toml');
const config = await readFile(configPath, 'utf8');
const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Existing Wrangler OAuth credential not available.');
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const worker = 'zoomix-payment-reminders';
const schedules = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${worker}/schedules`, {headers, signal: AbortSignal.timeout(20000)});
const scheduleData = await schedules.json();
console.log(JSON.stringify({check:'configured schedules',httpStatus:schedules.status,success:scheduleData.success,result:scheduleData.result,errors:scheduleData.errors},null,2));
const query = `query { viewer { accounts(filter: {accountTag: "${account}"}) { workersInvocationsScheduled(limit: 20, filter: {scriptName: "${worker}", datetime_geq: "2026-10-09T00:00:00Z"}, orderBy: [datetime_DESC]) { datetime scheduledDatetime cron scriptName status } } } }`;
const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {method:'POST',headers,body:JSON.stringify({query}),signal:AbortSignal.timeout(20000)});
const result = await response.json();
console.log(JSON.stringify({check:'actual scheduled invocations',httpStatus:response.status,data:result.data,errors:result.errors},null,2));
if (!response.ok || result.errors?.length || !schedules.ok || !scheduleData.success) process.exitCode=1;
